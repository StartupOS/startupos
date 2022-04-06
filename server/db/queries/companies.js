/**
 * @file Defines the queries for the organizations table/views.
 */

 const db = require('../');

 const createCompany = async company => {
    const {
        name, 
        ein, 
        description, 
        logo, 
        street1, 
        street2, 
        city, 
        state,
        country,
        owner
    } = company;
    const query = {
      // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
      text: `INSERT INTO organizations_table (
          name, 
          ein, 
          description, 
          logo, 
          street1, 
          street2, 
          city, 
          state, 
          country,
          owner) 
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
          ) RETURNING *;`,
      values: [
        name, 
        ein, 
        description, 
        logo, 
        street1, 
        street2, 
        city, 
        state,
        country,
        owner
        ]
    };
    const { rows } = await db.query(query);
    return rows[0];
  };

// TODO: Delete (see /server/routes/companies.js)

const listCompanies = async userId => {
    const query = {
        text: `
              select o.* 
              from organizations_table o
              left outer join organization_memberships m
              on m.organization_id=o.id
              where owner = $1 or (membership_type='viewer' and user_id=$1)`,
        values: [userId]
    }
    const { rows } = await db.query(query);
    console.log(rows);
    if(!rows){
      return []
    }
    return rows
}

const setRiskScore = async (id, score)=>{
  const query = {
    text: `
      update organizations_table
      set risk_score=$1
      where id=$2
      returning *
    `,
    values:[score, id]
  }
  const { rows } = await db.query(query);
  return rows;
}

const updateSharing = async q =>{
  console.log(5.1);
  const { userId, company} = q;
  console.log(company);
  const { shared, id } = company;
  console.log(5.2);
  console.log(userId)
  console.log(id);
  const getCompanyQuery = {
    text: 'select * from organizations_table where owner=$1 and id=$2',
    values: [userId, id]
  }
  console.log(5.21);
  const resp = await db.query(getCompanyQuery)
  // console.log(resp);
  console.log(5.22);
  const actualCompany = resp.rows[0];
  console.log(actualCompany);
  if(!actualCompany || +actualCompany.owner != +userId){
    return [];
  }
  console.log(5.3)
  const deleteQuery = {
    text:'delete from organization_memberships where organization_id=$1 returning *',
    values:[actualCompany.id]
  }
  try {
    const deleted = await db.query(deleteQuery);
    const deletedRows = deleted.rows;
    console.log(5.4);
    console.log('deleted:')
    console.log(deletedRows);
  } catch(ex){
    console.log(ex); 
    throw new Error('fuck it')
  }
  
  
  console.log(5.5)
  console.log(shared);
  for(let u of shared){
    console.log('running')
    console.log(u);
    const query = {
      text: 'insert into organization_memberships (user_id, organization_id, membership_type) values($1,$2,$3) returning *',
      values: [u, actualCompany.id, 'viewer']
    }
    let { rows } = await db.query(query);
    console.log(rows[0]);
  }
  
  const selectQuery = {
    text:'select * from organization_memberships where organization_id=$1',
    values:[actualCompany.id]
  }
  const selectedResp = await db.query(selectQuery)
  const selectedRows = selectedResp.rows;
  console.log(selectedRows);
  return selectedRows;
}

/**
 * Grant the permissions to the org on the company
 *
 * @param {number} orgId the ID of the org gaining permissins.
 * @param {number} companyId the ID of the target company.
 * @param {string[]} permissions list of permissions to grant.
 * @returns {Object} an object containing the arguments.
 */
 const grantPermissionsToOrg = async (orgId, companyId, permissions)=>{
  for(p in permissions){
    const query = {
      text:` 
        insert into org_relations 
        (subject, object, type) 
        values
        ($1,$2,$3)
        returning *;
      `,
      values:[orgId, companyId, p]
    }
    await db.q(query);
  }
  return {userId, companyId, permissions}
}
/**
 * Revokes the permissions to the user on the company
 *
 * @param {number} orgId the ID of the user.
 * @param {number} companyId the ID of the target company.
 * @param {string[]} permissions list of permissions to grant.
 * @returns {Object} an object containing the arguments.
 */
 const revokePermissionsFromOrg = async (orgId, companyId, permissions)=>{
  for(p in permissions){
    const query = {
      text:` 
        delete from org_relations 
        where
          subject = $1 and
          object=$2 and 
          type=$3
      `,
      values:[userId, companyId, p]
    }
    await db.q(query);
  }
  return {userId, companyId, permissions}
}

/**
 * Grant the permissions to the user on the company
 *
 * @param {number} userId the ID of the user.
 * @param {number} companyId the ID of the target company.
 * @param {string[]} permissions list of permissions to grant.
 * @returns {Object} an object containing the arguments.
 */
 const grantPermissions = async (userId, companyId, permissions)=>{
  for(p in permissions){
    const query = {
      text:` 
        insert into organization_memberships 
        (user_id, organization_id, membership_type) 
        values
        ($1,$2,$3)
        returning *;
      `,
      values:[userId, companyId, p]
    }
    await db.q(query);
  }
  return {userId, companyId, permissions}
}

/**
 * Revokes the permissions to the user on the company
 *
 * @param {number} userId the ID of the user.
 * @param {number} companyId the ID of the target company.
 * @param {string[]} permissions list of permissions to grant.
 * @returns {Object} an object containing the arguments.
 */
 const revokePermissions = async (userId, companyId, permissions)=>{
  for(p in permissions){
    const query = {
      text:` 
        delete from organization_memberships 
        where
          user_id = $1 and
          organization_id=$2 and 
          membership_type=$3
      `,
      values:[userId, companyId, p]
    }
    await db.q(query);
  }
  return {userId, companyId, permissions}
}


/**
 * Checks to see if a user has any of the acceptable permissions
 * 
 * More accurately, does the user have the permissions, or are they
 * the owner or employee of a company with those permissions.
 *
 * @param {number} userId the ID of the user.
 * @param {number} companyId the ID of the target company.
 * @param {string[]} permissions list of acceptable permissions.
 * @returns {boolean} the new property.
 */
const hasPermissions = async (userId, companyId, permissions)=>{
  const query = {
    text:` 
      select *
      from organizations_table o
      full outer join org_relations p
      on p.object=o.id
      full outer join organization_memberships m
      on 
        m.organization_id=o.id
      full outer join organization_memberships m2
      on m2.organization_id=p.subject
      full outer join organizations_table o2
      on o2.id=p.subject
      
      where 
        o.id=$2 and
        (
          o.owner = $1 or 
          (
            m.membership_type=ANY($3::text[]) and 
            m.user_id=$1
          ) or (
            m2.membership_type='employee' and
            m2.user_id=$1 and
            type=ANY($3::text[])
          ) or (
            o2.owner=$1 and
            type=ANY($3::text[])
          )
        )
    `,
    values:[userId, companyId, permissions]
  }
  try{
    const res = await db.q(query);
    return !!res.length
  } catch(ex){
    console.log('error in hasPermissions');
    console.log(ex);
  }
}

const companiesWithPermissions = async(userId, permissions)=>{
  const query = {
    text:` 
      select o.id
      from organizations_table o
      full outer join org_relations p
      on p.object=o.id
      full outer join organization_memberships m
      on 
        m.organization_id=o.id
      full outer join organization_memberships m2
      on m2.organization_id=p.subject
      full outer join organizations_table o2
      on o2.id=p.subject
      
      where 
        (
          o.owner = $1 or 
          (
            m.membership_type=ANY($2::text[]) and 
            m.user_id=$1
          ) or (
            m2.membership_type='employee' and
            m2.user_id=$1 and
            type=ANY($2::text[])
          ) or (
            o2.owner=$1 and
            type=ANY($2::text[])
          )
        )
    `,
    values:[userId, permissions]
  }
  try{
    const rows = await db.q(query);
    return rows;
  } catch(ex){
    console.log('error in companiesWithPermissions');
    console.log(ex);
  }
}

const retrieveCompany = async q => {
    const {userId, companyId} = q;
    const query = {
        text: `select o.* 
        from organizations_table o
        full outer join organization_memberships m
        on m.organization_id=o.id
        where 
          o.id=$2 and
          (owner = $1 or (membership_type='viewer' and user_id=$1))`,
        values: [userId, companyId]
    }
    const { rows } = await db.query(query);
    return rows[0]
}

const listFunders = async ()=>{
  const sql=`
    select * from organizations_table
    where is_funder=true
  `
  try {
    const r = await db.q(sql);
    return r
  } catch(ex){
    console.log('\n\n\n\n\n')
    console.log(ex)
    console.log('\n\n\n\n\n')
  }
}

const makeSharingTarget = async (companyId) => {
  const query = {
    text: `
      update organizations_table
      set is_funder=true
      where id=$1
      returning *
    `,
    values:[companyId]
  };
  return await db.q(query);
}

const revokeSharingTarget = async (companyId) => {
  const query = {
    text: `
      update organizations_table
      set is_funder=false
      where id=$1
      returning *
    `,
    values:[companyId]
  };
  return await db.q(query);
}

const getOwnedOrg = async q => {
  const { userId, companyId } = q;
  const query = {
    text: `
      select * 
      from organizations_table
      where
        owner=$1 and
        id=$2
    `,
    values: [userId, companyId]
  };
  const { rows } = await db.query(query);
  return rows;
}

const deleteCompany = async q => {
    const {userId, companyId} = q;
    const query = {
        text: 'delete from organizations_table where owner=$1 and id=$2 returning *',
        values: [userId, companyId]
    }
    const { rows } = await db.query(query);
    return rows[0]
}

const updateCompany = async q => {
    const {userId, company} = q
    const {
        id:companyId,
        name, 
        ein, 
        description, 
        logo, 
        street1, 
        street2, 
        city, 
        state,
        country,
        owner
    } = company;
    console.log("companyId", companyId)
    const query = {
      // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
      text: `Update organizations_table 
          set 
            name = $3, 
            ein = $4, 
            description = $5, 
            logo = $6, 
            street1 = $7, 
            street2 = $8, 
            city = $9, 
            state = $10, 
            country = $11,
            owner = $12
          where owner=$1 and id=$2
          RETURNING *;`,
      values: [
        userId,
        companyId,
        name, 
        ein, 
        description, 
        logo, 
        street1, 
        street2, 
        city, 
        state,
        country,
        owner
        ]
    };
    const { rows } = await db.query(query);
    return rows[0];
  };


// retrieveAccountsByCompanyId
/**
 * Retrieves all accounts for a single company.
 *
 * @param {number} companyId the ID of the company.
 *
 * @returns {Object[]} an array of accounts.
 */
 const retrieveAccountsByCompanyId = async companyId => {
    const query = {
      text: 'SELECT * FROM accounts WHERE organization_id = $1 ORDER BY id',
      values: [companyId],
    };
    const resp = await db.query(query);
    // console.log(resp);
    const { rows: accounts } = resp;
    return accounts;
  };
/**
 * Retrieves all transactions for a single company.
 *
 *
 * @param {number} companyId the ID of the company.
 * @returns {Object[]} an array of transactions.
 */
 const retrieveTransactionsByCompanyId = async companyId => {
    const query = {
      text: 'SELECT * FROM transactions WHERE organization_id = $1 ORDER BY date DESC',
      values: [companyId],
    };
    const { rows: transactions } = await db.query(query);
    return transactions;
  };
// retrieveItemsByCompany
/**
 * Retrieves all items for a single company.
 *
 * @param {number} companyId the ID of the company.
 * @returns {Object[]} an array of items.
 */
 const retrieveItemsByCompany = async companyId => {
    const query = {
      text: 'SELECT * FROM items WHERE organization_id = $1',
      values: [companyId],
    };
    console.log('retrieve Items By Company')
    const resp = await db.query(query);
    const { rows: items } = resp
    return items;
  };

const retrieveCompaniesSharingWithMe = async companyId => {
  const sql = `
    select subject, array_agg(type)
    from org_relations
    where
      type in (
        'viewBalance',
        'viewTransactions',
        'viewEmployees',
        'viewEmployeeDetails',
        'viewInsurance'
      ) and
      subject = $1
      group by subject
  `
  const query = {
    text:sql,
    values:[companyId]
  }
  const rows=await db.q(query);
  return rows
}
const retrieveCompaniesIShareWith = async companyId => {
  const sql = `
    select subject, array_agg(type)
    from org_relations
    where
      type in (
        'viewBalance',
        'viewTransactions',
        'viewEmployees',
        'viewEmployeeDetails',
        'viewInsurance'
      ) and
      object = $1
      group by subject
  `
  const query = {
    text:sql,
    values:[companyId]
  }
  const rows=await db.q(query);
  return rows
}

module.exports={
    createCompany,
    listCompanies,
    retrieveCompany,
    updateCompany,
    deleteCompany,
    retrieveTransactionsByCompanyId,
    retrieveItemsByCompany,
    retrieveAccountsByCompanyId,
    updateSharing,
    getOwnedOrg,
    setRiskScore,
    makeSharingTarget,
    revokeSharingTarget,
    hasPermissions,
    companiesWithPermissions,
    retrieveCompaniesSharingWithMe,
    retrieveCompaniesIShareWith,
    grantPermissions,
    revokePermissions,
    grantPermissionsToOrg,
    revokePermissionsFromOrg,
    listFunders
}
