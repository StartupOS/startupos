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

const xAccountToken = "TEST_ACCOUNT_TOKEN"; 
const opts = {expand:"employments"};

// const i2 = new MergeHrisApi.EmploymentsApi()
apiInstance.employeesList(xAccountToken, opts, (error, data) => {
  if (error) {
    console.error(error);
  } else {
    const { results } = data;
    console.log(results);
    const reduced = results.map((e)=>{ 
        const r = {
            id: e.id,
            rate: e.pay_rate, 
            period: e.pay_period,
            frequency: e.pay_frequency
        };
        return r;
    })
    // console.log(reduced)
    const sum = reduced.reduce((p,c)=>{return p+c.rate},0)
    // console.log(sum);
    console.log('Monthly Burn: $', Math.round(sum*100/12)/100)
  }
});

// const i3 = new MergeHrisApi.EmployeePayrollRunsApi();
// i3.employeePayrollRunsList(xAccountToken, {created_after:"2020-01-01"}, (error, data)=>{
//     if(error){
//         console.log(error);
//     } else {
//         const { results } = data
//         const last = results[0];
//         const start = Date.parse(last.start_date)
//         // console.log(start);
//         const end = Date.parse(last.end_date)
//         const diff = (end-start)/(365*24*60*60*1000)
//         // console.log(diff);
//         // console.log(results);
//         // console.log(last.gross_pay);
//         console.log('Monthly Burn: $', Math.round(last.gross_pay/diff/12));
//     }
// })