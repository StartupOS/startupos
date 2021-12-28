const db = require('../');

const createMergeToken = async (userId, companyId, token) => {
    const query = {
        text: `
            insert 
            into merge_tokens_table
            (organization_id, token, created_by)
            values
            ($1,$2, $3)
            `,
        values: [companyId, token, userId]
    }
    const { rows } = db.query(query);
    return rows;
}

module.exports = {
    createMergeToken
};