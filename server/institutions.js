const plaidClient = require('./plaid');

const {
    listUsedInstitutions,
    updateInstitution
} = require('./db/queries');

async function getInstitutionInfoFromPlaid(id){
    const request = {
        institution_id: id,
        country_codes: ['US'],
        options:{
            include_optional_metadata: true,
            include_status: true
        }
      };
      try {
        const response = await plaidClient.institutionsGetById(request);
        const institution = response.data.institution;
        return institution;
      } catch (error) {
        // Handle error
        console.log('Error Updating Institutions');
        console.log(error);
      }
}

const refreshInstitutions = async()=>{
  console.log('UPDATING INSTITUTIONS');
  const institutionsUsed = await listUsedInstitutions();
  for(let i of institutionsUsed){
    const updated = await getInstitutionInfoFromPlaid(i.plaid_institution_id);
    updated.plaid_institution_id = i.plaid_institution_id;
    updateInstitution(updated);
  }
}

module.exports={
    refreshInstitutions
}