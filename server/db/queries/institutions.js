const db = require('../');

const listUsedInstitutions = async()=>{
    const query = {
        text: `select distinct plaid_institution_id from accounts`
    }
    const {rows} = await db.query(query);
    return rows;
}
const updateInstitution = async(institution)=>{
    const {
        plaid_institution_id,
        name,
        products,
        country_codes,
        url,
        logo,
        primary_color,
        routing_numbers,
        status
    } = institution
    const query = {
        text: `
            insert into institutions_table
            (
                plaid_institution_id,
                name,
                products,
                country_codes,
                url,
                logo,
                primary_color,
                routing_numbers,
                status
            )
            VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            on conflict (plaid_institution_id)
            do update set
                plaid_institution_id=$1,
                name=$2,
                products=$3,
                country_codes=$4,
                url=$5,
                logo=$6,
                primary_color=$7,
                routing_numbers=$8,
                status=$9;
        `,
        values: [
            plaid_institution_id,
            name,
            products,
            country_codes,
            url,
            logo,
            primary_color,
            routing_numbers,
            status
        ]
    }
    const {rows} = await db.query(query);
    return rows;
}

module.exports = {
    listUsedInstitutions,
    updateInstitution
}