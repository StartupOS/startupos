const db = require('../');

const createMergeToken = async (userId, companyId, token) => {
    const query = {
        text: `
            insert 
            into merge_tokens_table
            (organization_id, token, user_id)
            values
            ($1,$2, $3);
            `,
        values: [companyId, token, userId]
    }
    const { rows } = await db.query(query);
    return rows;
}

const retrieveMergeTokens = async (companyId) => {
    const query = {
        text: `
            select token 
            from merge_tokens_table
            where organization_id=$1;
            `,
        values: [companyId]
    }
    console.log(query);
    const { rows } = await db.query(query);
    console.log(query);
    console.log(rows);
    return rows;
}



module.exports = {
    createMergeToken,
    retrieveMergeTokens
};