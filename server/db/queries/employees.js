const { PaymentInitiationPaymentGetResponseStatusEnum } = require('plaid');
const db = require('../');

// organization_id,
// merge_id,
// employee_number,
// first_name,
// last_name,
// display_full_name,
// work_email,
// personal_email,
// mobile_phone_number,
// hire_date,
// start_date,
// employment_status,
// termination_date,
// avatar,
// rate,
// period,
// frequency,
// job_title,


const deleteAllEmployees = async(companyId)=>{
    const query = {
        text: `
            UPDATE employees_table
            SET deleted=true
            WHERE organization_id=$1;
        `,
        values: [companyId]
    }
    const { rows } = await db.query(query);
    return rows;
}

const upsertEmployees = async (companyId, employees)=>{
    const deleted = await deleteAllEmployees(companyId);
    const outerRows = [];
    for( let e of employees ){
        let query = {
            text : `
                INSERT INTO employees_table
                (
                    organization_id,
                    merge_id,
                    employee_number,
                    first_name,
                    last_name,
                    display_full_name,
                    work_email,
                    personal_email,
                    mobile_phone_number,
                    hire_date,
                    start_date,
                    employment_status,
                    termination_date,
                    avatar,
                    rate,
                    period,
                    frequency,
                    job_title
                )
                values
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
                ON CONFLICT (merge_id) DO UPDATE SET
                    organization_id=$1,
                    merge_id=$2,
                    employee_number=$3,
                    first_name=$4,
                    last_name=$5,
                    display_full_name=$6,
                    work_email=$7,
                    personal_email=$8,
                    mobile_phone_number=$9,
                    hire_date=$10,
                    start_date=$11,
                    employment_status=$12,
                    termination_date=$13,
                    avatar=$14,
                    rate=$15,
                    period=$16,
                    frequency=$17,
                    job_title=$18,
                    deleted=false
                returning *;
            `,
            values: [
                companyId, 
                e.merge_id, 
                e.employee_number, 
                e.first_name,
                e.last_name,
                e.display_full_name,
                e.work_email,
                e.personal_email,
                e.mobile_phone_number,
                e.hire_date,
                e.start_date,
                e.employment_status,
                e.termination_date,
                e.avatar,
                e.rate,
                e.period,
                e.frequency,
                e.job_title
            ]
        };
        const { rows } = await db.query(query);
        console.log(rows);
        if(rows)
            outerRows.push(...rows);
    }
    return outerRows;
}

const listEmployees = async (companyId)=>{
    const query = {
        text: `
            SELECT * FROM employees_table
            WHERE organization_id=$1;
        `,
        values:[companyId]
    }
    const { rows } = await db.query(query);
    return rows; 
}

const retrieveEmployee = async (employeeId)=>{
    const query = {
        text: `
            SELECT * FROM employees_table
            WHERE id=$1;
        `,
        values:[employeeId]
    }
    const { rows } = await db.query(query);
    return rows[0];
}

module.exports = {
    upsertEmployees,
    listEmployees,
    retrieveEmployee
}


