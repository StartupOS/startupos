const Boom = require('@hapi/boom');
const express = require('express');
const MergeHrisApi = require('@mergeapi/merge_hris_api');

const { 
    PRODUCTION_MERGE_API_KEY,
    MERGE_API_KEY
 } = process.env;
const { asyncWrapper } = require('../middleware');
const { 
    createMergeToken,
    retrieveMergeTokens, 
    getOwnedOrg 
} = require('../db/queries');

const router = express.Router();

let defaultClient = MergeHrisApi.ApiClient.instance;
defaultClient.authentications['tokenAuth'] = {type: "bearer", accessToken: PRODUCTION_MERGE_API_KEY}

router.get('/:companyId/link_token', asyncWrapper(async(req,res)=>{
    const user = await req.user;
    const { companyId } = await req.params
    const q = {userId:user.id, companyId}
    // Get Details
    const rows = await getOwnedOrg(q);
    // TODO: add ABAC
    const org = rows[0];
    if(!org){
        throw new Boom('Error Generating Link Token', { statusCode: 400, payload:{message: "Only the owner can request link tokens"} });
    }

    const endUserDetails = {
        "end_user_origin_id": org.id, // unique entity ID
        "end_user_organization_name": org.name,  // your user's organization name
        "end_user_email_address": user.username, // your user's email address
        "categories": ["hris", "ats", "accounting"] // choose your category
      }

    const apiInstance = new MergeHrisApi.LinkTokenApi();


    apiInstance.linkTokenCreate(endUserDetails, (error, data) => {
        if (error) {
            // console.error(error);
            throw new Boom('Error Generating Link Token', { statusCode: 500, payload:{message: error} });
        } else {
            console.log(data.link_token);
            res.json(data);
        }
    });
}));

router.post('/:companyId/exchange_token', asyncWrapper(async (req, res)=>{
    console.log('exchanging');
    const user = await req.user;
    const userId = user.id;
    const { companyId } = await req.params
    const { publicToken } = await req.body;
    const q = {userId, companyId, publicToken}
    console.log(q);
    const apiInstance = new MergeHrisApi.AccountTokenApi();
    apiInstance.accountTokenRetrieve(publicToken, async (error, data) => {
        console.log('Callback');
        if (error) {
            console.error(error);
            throw new Boom('Error Exchanging Public Token', { statusCode: 500, payload:{message: error} });
        } else {
            try {
                // Does the user actually have permission to create this token?
                const o = await getOwnedOrg({userId, companyId});
                console.log('o');
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

router.get('/:companyId/has_token', asyncWrapper(async(req,res)=>{
    const user = await req.user;
    const userId = user.id;
    const { companyId } = await req.params
    const r = {hasToken:false};
    
    // Does the user actually have permission to see this token?
    const o = []
    try {
        const o1 = await getOwnedOrg({userId, companyId})
        o.push(...o1);
    } catch(ex) {
        console.log(ex);
        throw new Boom('Query Error', {statusCode:500, payload:ex})
    }
    if(!(o.length)){
        throw new Boom('User does not own org', { statusCode: 403, payload:{
            id: user.id,
            companyId
        }})
    }
    // Retrieve list of all tokens
    const t = await retrieveMergeTokens(companyId);
    // Cast length to boolean 0 = false else true
    r.hasToken = !!t.length;
    return res.json(r);
}));

module.exports=router;