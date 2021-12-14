/**
 * @file Defines all routes for the Companies route.
 */
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const qs = require('query-string');
const express = require('express');
const Boom = require('@hapi/boom');
const {
    createCompany,
    listCompanies,
    retrieveCompany,
    updateCompany,
    deleteCompany
} = require('../db/queries');
const { asyncWrapper } = require('../middleware');

const router = express.Router();

router.post('/', asyncWrapper(
    async (req,res) => {
        console.log(req);
        const user = await req.user;
        const company = req.body;
        console.log(user);
        console.log(company);
        // make this user owner (userID)
        company.owner = user.id;

        // attempt to create if EIN and Name unique
        try{
            const newCompany = await createCompany(company)
            res.json(newCompany);
        } catch (ex) {
            console.log(ex);
            throw new Boom('Username already exists', { statusCode: 500, payload:{message: ex.message} });
        }
        
    }
))

router.get('/', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        // return all companies associated to this userID
        const companies = await listCompanies(user.id);
        res.json(companies);
    }
))

router.get('/:companyid', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        const { companyid } = req.params;
        const q = {userId:user.id, companyId:companyid};
        // return this company if it exists and is associated to this user
        const company = await retrieveCompany(q);
        res.json(company)
    }
))

router.put('/:companyid', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        const company = req.body;
        const q = {userId:user.id, company};
        // update and return this company if it exists and is associated to this user
        const newCompany = await updateCompany(q);
        res.json(newCompany);
    }
))

router.delete('/:companyid', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        const company = req.body;
        const q = {userId:user.id, companyId: company.id};
        // delete this company if it exists and is associated to this user and return 204
        const oldCompany = await deleteCompany(q);
        res.json(oldCompany);
    }
))

module.exports=router;
