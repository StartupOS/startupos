const db = require('../');
/*
name text UNIQUE,
description text,
logo text,
street1 text,
street2 text,
city text,
state text,
coountry text,
owner integer NOT NULL REFERENCES users_table(id) ON DELETE CASCADE
*/

async function createOrganization(org){
    const [name, description, logo, street1, street2, city, state, country, owner] = {org}
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: `
            INSERT INTO organizations (name, description, logo, street1, street2, city, state, country, owner) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        values: [name, description, logo, street1, street2, city, state, country, owner],
    };
    const { rows } = await db.query(query);
    return rows[0];
}

async function retrieveOrganizationById(id){
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: 'SELECT * FROM organizations where id=$1',
        values=[id]
    };
    const { rows } = await db.query(query);
    return rows[0];
}

// TODO: Update to retrieve where member, not where owner
async function retrieveOrganizationsByUser(userId){
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: 'SELECT * FROM organizations where owner=$1',
        values=[userId]
    };
    const { rows } = await db.query(query);
    return rows;
}
async function updateOrganization(org){
    const [id, name, description, logo, street1, street2, city, state, country, owner] = {org}
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: `
            UPDATE organizations 
            SET 
                name=$2, 
                description=$3, 
                logo=$4, 
                street1=$5, 
                street2=$6, 
                city=$7, 
                state=$8, 
                country=$9, 
                owner=$10 
            WHERE
                id=$1
            RETURNING *;`,
        values: [id, name, description, logo, street1, street2, city, state, country, owner],
    };
    const { rows } = await db.query(query);
    return rows[0];
}
async function deleteOrganization(id){
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: 'DELETE FROM organizations where id=$1 RETURNING *',
        values=[id]
    };
    const { rows } = await db.query(query);
    return rows[0];
}

module.exports = {
    createOrganization,
    retrieveOrganizationById,
    retrieveOrganizationsByUser,
    updateOrganization,
    deleteOrganization
}