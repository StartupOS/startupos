const MergeHrisApi = require('@mergeapi/merge_hris_api');

const { MERGE_API_KEY } = process.env;


let defaultClient = MergeHrisApi.ApiClient.instance;

// Swap YOUR_API_KEY below with your production key from:
// https://app.merge.dev/configuration/keys 

defaultClient.authentications['tokenAuth'] = {type: "bearer", accessToken: MERGE_API_KEY}

const apiInstance = new MergeHrisApi.EmployeesApi();

// The string 'TEST_ACCOUNT_TOKEN' below works to test your connection
// to Merge and will return dummy data in the response.
// In production, replace this with your user's account_token.

const xAccountToken = "4LxwPCvKm7Mhx7s9C_MfLwqUNEgZeJ7as1PNbOiKxTbztxpjLLJdbg"; 
const opts = {expand:"employments"};
const s = "4LxwPCvKm7Mhx7s9C_MfLwqUNEgZeJ7as1PNbOiKxTbztxpjLLJdbg";


// const i2 = new MergeHrisApi.EmploymentsApi()
apiInstance.employeesList(xAccountToken, opts, (error, data) => {
  if (error) {
    console.error(error);
  } else {
    const { results } = data;
    // console.log(results);
    // const chosenOnes = results.filter((e)=>{return e.first_name[0] == "B"});
    // chosenOnes.forEach((chosenOne)=>{
    //   console.log(chosenOne.display_full_name)
    //   console.log(chosenOne.employment_status)
    //   console.log(chosenOne.employments);
    //   console.log('');
    // })
    
    // console.log('\n\n\n');
    const reduced = results.map((e)=>{ 
        const emp = e.employments[0];
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
    }).filter((e)=>e.employment_status == 'ACTIVE');
    console.log(reduced)
    const sum = reduced.reduce((p,c)=>{return p+c.rate},0)
    // console.log(sum);
    console.log('Monthly Burn: $', Math.round(sum*100/12)/100)
  }
});

const i3 = new MergeHrisApi.EmployeePayrollRunsApi();
// {created_after:"2020-01-01"}
i3.employeePayrollRunsList(xAccountToken, {}, (error, data)=>{
    if(error){
        console.log(error);
    } else {
        const { results } = data
        console.log(results)
        return
        const last = results[0];
        const start = Date.parse(last.start_date)
        // console.log(start);
        const end = Date.parse(last.end_date)
        const diff = (end-start)/(365*24*60*60*1000)
        // console.log(diff);
        // console.log(results);
        // console.log(last.gross_pay);
        console.log('Monthly Burn: $', Math.round(last.gross_pay/diff/12));
    }
})