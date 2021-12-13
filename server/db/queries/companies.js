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
        text: 'select * from organizations_table where owner=$1',
        values: [userId]
    }
    const { rows } = await db.query(query);
    return rows
}

const retrieveCompany = async q => {
    const {userId, companyId} = q;
    const query = {
        text: 'select * from organizations_table where owner=$1 and id=$2',
        values: [userId, companyId]
    }
    const { rows } = await db.query(query)[0];
    return rows[0]
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
    } = company;
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

module.exports={
    createCompany,
    listCompanies,
    retrieveCompany,
    updateCompany,
    deleteCompany
}
