const Boom = require('@hapi/boom');
const express = require('express');
const MergeHrisApi = require('@mergeapi/merge_hris_api');

const { MERGE_API_KEY } = process.env;
const { asyncWrapper } = require('../middleware');
const { createMergeToken, getOwnedOrg } = require('../db/queries');

const router = express.Router();

let defaultClient = MergeHrisApi.ApiClient.instance;
defaultClient.authentications['tokenAuth'] = {type: "bearer", accessToken: MERGE_API_KEY}
const apiInstance = new MergeHrisApi.LinkTokenApi();

router.get('/:companyId/link_token', asyncWrapper(async(req,res)=>{
    const user = req.user;
    const { companyId } = req.params
    const q = {userId:user.id, companyId}
    // Get Details
    const org = await getOwnedOrg(q);

    const endUserDetails = {
        "end_user_origin_id": org.id, // unique entity ID
        "end_user_organization_name": org.name,  // your user's organization name
        "end_user_email_address": user.username, // your user's email address
        "categories": ["hris", "ats", "accounting"] // choose your category
      }
      
    apiInstance.linkTokenCreate(endUserDetails, (error, data) => {
        if (error) {
            console.error(error);
            throw new Boom('Error Generating Link Token', { statusCode: 500, payload:{message: error} });
        } else {
            console.log(data.link_token);
            res.json(data);
        }
    });
}));

router.post('/:companyId/exchangeToken', asyncWrapper(async (req, res)=>{
    const user = req.user;
    const { companyId } = req.params
    const { publicToken } = req.body;
    const q = {userId:user.id, companyId}

    apiInstance.accountTokenRetrieve(publicToken, (error, data) => {
        if (error) {
            console.error(error);
            throw new Boom('Error Exchanging Public Token', { statusCode: 500, payload:{message: error} });
        } else {
            console.log(data.account_token);
            try {
                // Does the user actually have permission to create this token?
                const o = await getOwnedOrg({userId, companyId});
                if(o[0]){
                    await createMergeToken(user.id, companyId, data.account_token)
                } else {
                    throw new Boom('User does not own org', { statusCode: 403, payload:{
                        id: user.id,
                        companyId
                    }})
                }
            } catch(e) {
                throw new Boom('Error Persisting Public Token', { statusCode: 500, payload:{message: error} });
            }
            res.sendStatus(200);
        }
    });
}))

module.exports=router;