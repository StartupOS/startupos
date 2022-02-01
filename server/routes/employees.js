const Boom = require('@hapi/boom');
const express = require('express');
const MergeHrisApi = require('@mergeapi/merge_hris_api');

const { 
    PRODUCTION_MERGE_API_KEY,
    MERGE_API_KEY
 } = process.env;
const { asyncWrapper } = require('../middleware');
const { 
    retrieveMergeTokens,
    upsertEmployees,
    listEmployees,
    retrieveEmployee, 
    hasPermissions 
} = require('../db/queries');
const { token } = require('morgan');

const router = express.Router();

let defaultClient = MergeHrisApi.ApiClient.instance;
defaultClient.authentications['tokenAuth'] = {type: "bearer", accessToken: PRODUCTION_MERGE_API_KEY}

router.post('/:companyId/update', asyncWrapper(async (req, res)=>{
    console.log('test');
    const user = await req.user;
    const { companyId } = await req.params;
    const userId = user.id;

    // TODO: Migrate from RBAC to ABAC
    const hasPermission = await hasPermissions(userId, companyId, ['updateEmployees'])
    if(hasPermission){
        console.log('has permission');
    } else {
        throw new Boom('Only Owner can trigger an update', {statusCode: 400})
    }

    // Get Account Token
    const accountTokens = [];
    try {
        console.log('test 2');
        const r = await retrieveMergeTokens(companyId);
        accountTokens.push(...r.map((a=>a.token)));;
        console.log('test 2');
    } catch (err){
        console.log(err);
        throw new Boom('Error fetching Account Token', {statusCode:500, payload:{message:err}})
    }

    // Get Employees
    const apiInstance = new MergeHrisApi.EmployeesApi();
    const opts = {expand:"employments"};
    console.log('test 3');

    const fetchEmployees = (accountToken)=>new Promise((resolve,reject)=>{
        apiInstance.employeesList(accountToken, opts, (error,data)=>{
            if(error){
                reject(error)
            } else {
                const { results } = data;
                const reduced = results.map((e)=>{ 
                    // Most recent position is in e.employments[0]
                    const emp = e.employments[0];
                    
                    // Keep only what we care about. No PII.
                    const r = {
                        merge_id: e.id,
                        rate: emp.pay_rate, 
                        period: emp.pay_period,
                        frequency: emp.pay_frequency,
                        job_title: emp.job_title,
                        employee_number: e.employee_number,
                        first_name: e.first_name,
                        last_name: e.last_name,
                        display_full_name: e.display_full_name,
                        work_email: e.work_email,
                        personal_email: e.personal_email,
                        mobile_phone_number: e.mobile_phone_number,
                        hire_date: e.hire_date,
                        start_date: e.start_date,
                        employment_status: e.employment_status,
                        termination_date: e.termination_date,
                        avatar: e.avatar,
                    };
                    return r;
                }).filter((e)=>e.employment_status == 'ACTIVE'); // Ditch inactive employees
                resolve(reduced)
            }
        })
    })
    try {
        console.log('test 4');

        let errorString = 'fetching'
        // Get Employees (for real now)
        const employees = [];
        console.log('test 5')
        let c = 6;
        for(let token of accountTokens){
            console.log('test',c++);
            const e = await fetchEmployees(token);
            employees.push(...e);
        }
        console.log("employees:");
        console.log(employees);
        // Pass Array of employees to upsert query
        errorString = 'upserting'
        const upserted = await upsertEmployees(companyId, employees)
        console.log("upserted:")
        console.log(upserted)
        res.json(upserted);
    } catch (err) {
        console.warn(err)
        throw new Boom(`Something went wrong ${errorString} employees`, {statusCode:500, payload:{message:err}});
    }
}));

router.get('/:companyId', asyncWrapper(async (req, res)=>{
    const user = await req.user;
    const { companyId } = await req.params;
    const userId = user.id;
    // TODO: Migrate from RBAC to ABAC
    const hasPermission = await hasPermissions(userId, companyId, ['viewEmployees'])
    if(!hasPermission){
        console.log('Unauthorized');
        throw new Boom('No such company user authorized to view', {statusCode:404});
    }
    const employees = await listEmployees(companyId);
    res.json(employees);
}));

router.get('/:companyId/:employeeId', asyncWrapper(async (req, res)=>{
    const user = await req.user;
    const { companyId, employeeId } = await req.params;
    const userId = user.id;
    // TODO: Migrate from RBAC to ABAC
    const hasPermission = await hasPermissions(userId, companyId, ['viewEmployees'])
    if(!hasPermission){
        console.log('Unauthorized');
        throw new Boom('No such company user authorized to view', {statusCode:404});
    }
    const employee = await retrieveEmployee(employeeId);
    res.json(employee);
}));

module.exports=router;