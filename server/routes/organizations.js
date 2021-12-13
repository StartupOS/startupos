/**
 * @file Defines all routes for the Organizations route.
 */
 const express = require('express');
 const Boom = require('@hapi/boom');

 router.get('/', async (req, res)=>{
    const user = req.user;
    const {rows} = await retrieveOrganizationsByUser(user.id);
    return rows;
 });
 router.put('/', async (req,res)=>{
    const user=req.user;
    const org=req.body;
    org.owner=user.id;
    const {rows} = await createOrganization(org);
    return rows;
 });
 router.post('/:orgId', async (req,res)=>{
    const user=req.user;
    const org=req.body;
    const { orgId } = req.params;
    if(org.id && orgId != org.id){
        throw new Boom('OrgID different in URL and Body', { statusCode: 400 });
    }
    const {rows} = await retrieveOrganizationById(orgId);
    const orgs = rows;
    // TODO: Update to ABAC
    const canUpdate = orgs.filter(organization => organization.id == orgId && organization.owner == user.id);
    if(canUpdate){
        const {rows} = await updateOrganization(org);
        return 200;
    } else {
        throw new Boom('Only the owner can update an organization', { statusCode: 400 });
    }
 });

 router.delete('/:orgId', async (req,res)=>{
    const user=req.user;
    const { orgId } = req.params;
    const {rows} = await retrieveOrganizationsById(orgId);
    const orgs = rows;
    const canDelete = orgs.filter(org=>org.id == orgId && org.owner == user.id);
    if(canDelete){
        const results = await deleteOrganization(orgId);
        return 204;
    } else {
        throw new Boom('Only the Owner can delete an Organization', { statusCode: 400 });
    }
 });
 const router = express.Router();
 
 
 
 
 module.exports = router;
 