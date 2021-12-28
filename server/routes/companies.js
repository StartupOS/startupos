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
    updateSharing,
    deleteCompany,
    retrieveAccountsByCompanyId,
    retrieveItemsByCompany,
    retrieveTransactionsByCompanyId
} = require('../db/queries');
const {
    sanitizeAccounts,
    sanitizeItems,
    sanitizeTransactions,
    isValidItemStatus,
    validItemStatuses,
  } = require('../util');

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
            throw new Boom('Error Creating Company', { statusCode: 500, payload:{message: ex.message} });
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
        console.log(1);
        const user = await req.user;
        console.log(2)
        const company = req.body;
        console.log(3)
        const q = {userId:user.id, company};
        console.log(4)
        // update and return this company if it exists and is associated to this user
        const newCompany = await updateCompany(q);
        console.log(5);
        const newSharing = await updateSharing(q);
        console.log(6);
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

/**
 * Retrieves all items associated with a single user.
 *
 * @param {string} companyId the ID of the user.
 * @returns {Object[]} an array of items.
 */
 router.get(
    '/:companyId/items',
    asyncWrapper(async (req, res) => {
      const { companyId } = req.params;
      console.log('items 1')
      const items = await retrieveItemsByCompany(companyId);
      console.log('items 2');
      if(items.length===0){
        res.json([])
      } else {
        try{
            const sanitized = sanitizeItems(items)
            res.json(sanitized);
        } catch (ex) {
            console.log(ex);
            throw new Boom('Something\'s fucky', { statusCode: 500, payload:{message: ex.message} });
        }
      }
    })
  );
  
  /**
   * Retrieves all accounts associated with a single company.
   *
   * @param {string} companyId the ID of the user.
   * @returns {Object[]} an array of accounts.
   */
  router.get(
    '/:companyId/accounts',
    asyncWrapper(async (req, res) => {
      const { companyId } = req.params;
      const accounts = await retrieveAccountsByCompanyId(companyId);
      if(!accounts.length){
          res.json([])
      } else {
        const sanitized = sanitizeAccounts(accounts);
        res.json(sanitized);
      }
    })
  );
  
  /**
   * Retrieves all transactions associated with a single user.
   *
   * @param {string} companyId the ID of the user.
   * @returns {Object[]} an array of transactions
   */
  router.get(
    '/:companyId/transactions',
    asyncWrapper(async (req, res) => {
      const { companyId } = req.params;
      const transactions = await retrieveTransactionsByCompanyId(companyId);
      if(transactions.length ===0){
        res.json([])
      } else {
        res.json(sanitizeTransactions(transactions));
      }
    })
  );

module.exports=router;
