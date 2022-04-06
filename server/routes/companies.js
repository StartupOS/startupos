/**
 * @file Defines all routes for the Companies route.
 */
const moment = require('moment');
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
    retrieveTransactionsByCompanyId,
    listEmployees,
    listFunders,
    setRiskScore,
    hasPermissions,
    grantPermissions,
    makeSharingTarget,
    revokeSharingTarget,
    retrieveCompaniesSharingWithMe,
    retrieveCompaniesIShareWith
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

function payrollBreakDown(employees) {
  const hourly = employees.filter((e)=>e.period=='HOUR');
  const salaried = employees.filter((e)=>e.period=='YEAR');
  const projectedMonthlyHourly = hourly.reduce((p,c)=>p+(+c.rate),0)*160;
  const projectedMonthlySalaried = salaried.reduce((p,c)=>p+(+c.rate),0)/12;
  const projectedTotal = projectedMonthlyHourly + projectedMonthlySalaried
  // TODO: Fix with actual employees actually getting paid
  const actualMonthlyHourly = projectedMonthlyHourly*.75;
  const actualMonthlySalaried = projectedMonthlySalaried*.5;
  const actualTotal = actualMonthlyHourly + actualMonthlySalaried

  return {
    hourly,
    salaried,
    projectedMonthlyHourly,
    projectedMonthlySalaried,
    projectedTotal,
    actualMonthlyHourly,
    actualMonthlySalaried,
    actualTotal
  }
}

function tx_within(tx, startMonth, endMonth){
  const txDate = new Date(Date.parse(tx.date));

  return startMonth <= txDate && txDate<=endMonth;
}

function txInAccounts(tx, accounts){
  const { account_id } = tx;
  const validIds = accounts.map(a=>a.id);
  return validIds.includes(account_id);
}

const updateRiskScore = async (companyId)=>{
  console.log('updating risk score for company:', companyId);
  const employees = await listEmployees(companyId);
  const accounts = await retrieveAccountsByCompanyId(companyId);
  const transactions = await retrieveTransactionsByCompanyId(companyId);
  let riskScore = 0;

  const {
    hourly,
    salaried,
    projectedMonthlyHourly,
    projectedMonthlySalaried,
    projectedTotal,
    actualMonthlyHourly,
    actualMonthlySalaried,
    actualTotal
  } = payrollBreakDown(employees);

  if(transactions.length ===0){
    return 0;
  } else {
    const filterAccounts = (accounts, accountSubtypes) =>
      accounts
        .filter(a => accountSubtypes.includes(a.subtype) && !a.deleted);

    const filterTransactions = (
      transactions,
      desiredAccounts,
      monthsAgo=0
    )=>{
      const currentDate = new Date();
      const endMonth =  moment(currentDate).subtract(monthsAgo,'months').endOf('month').toDate();
      const startMonth =  moment(currentDate).subtract(monthsAgo,'months').startOf('month').toDate();
      const filteredTransactions = transactions.filter(t=>
          tx_within(t, startMonth, endMonth) &&
          txInAccounts(t, desiredAccounts)
      );
      return filteredTransactions;
    }
    const cashAccounts = filterAccounts(accounts, [
      'checking',
      'savings',
      'cd',
      'money market',
    ]);

    const currentCashBalance = cashAccounts.reduce((p,c)=>p+c.current_balance,0);
    const monthlyBalance = [currentCashBalance];
    const monthlyDelta = [];
    for(let i=0; i<6; i++){
      let prev = monthlyBalance[i];
      let delta = filterTransactions(transactions, cashAccounts, i)
        .reduce((p,c)=>Math.round((p+c.amount)*100)/100,0)*-1;
      monthlyDelta.push(delta);
      monthlyBalance.push(Math.round((prev+delta)*100)/100);
    }
    const avgBurn = monthlyDelta.reduce((p,c)=>p+c,0)/monthlyDelta.length;
    const weightedBurn = (avgBurn + monthlyDelta[1])/2 - actualTotal + projectedTotal;
    const monthsRemaining = Math.max(0, Math.round(currentCashBalance/weightedBurn*10)/10);
    
    if(monthsRemaining && !isNaN(monthsRemaining)){
      console.log(weightedBurn, avgBurn, monthlyDelta[1], monthlyDelta[5]);
      riskScore = Math.round(18/monthsRemaining*(weightedBurn-avgBurn)*(monthlyDelta[1]-monthlyDelta[5])/avgBurn/avgBurn*100);
    }

  }
  console.log('New Risk Score:', riskScore);
  return await setRiskScore(companyId, riskScore);

}

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
        console.log(user.id);
        // return all companies associated to this userID
        const companies = await listCompanies(user.id);
        companies.forEach((c)=>{updateRiskScore(c.id)});
        console.log(companies);
        res.json(companies);
    }
))

router.get('/funders', asyncWrapper(
  async (req,res) => {
      const funders = await listFunders();
      return res.json(funders);
  }
))

// Who can I see?
router.get('/:id/sees', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { id } = await req.params;
      const hasPermission = hasPermissions(user.id, id, ['employee, viewShares']);
      if(hasPermission){
        return res.json(await retrieveCompaniesSharingWithMe(id));
      } else {
        return res.json([])
      }
  }
))

// Who can see me?
router.get('/:id/seen_by', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { id } = await req.params;
      const hasPermission = hasPermissions(user.id, id, ['employee, viewShares']);
      if(hasPermission){
        return res.json(await retrieveCompaniesIShareWith(id));
      } else {
        return res.json([])
      }
  }
))

router.get('/:companyId', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        const { companyId } = req.params;
        updateRiskScore(companyId)
        const hasPermission = hasPermissions(user.id, companyId, ['viewCompany', 'viewer', 'employee']);
        const q = {userId:user.id, companyId};
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
        console.log(company);
        updateRiskScore(company.id)

        console.log(3)
        const q = {userId:user.id, company};
        console.log(q)
        console.log(4)

        // update and return this company if it exists and is associated to this user
        const newCompany = await updateCompany(q);
        console.log(5);
        if(company.shared){
          q.company=newCompany;
          const newSharing = await updateSharing(q);
        }
        console.log(6);
        console.log(newCompany);
        res.json(newCompany);
    }
))

router.delete('/:companyId', asyncWrapper(
    async (req,res) => {
        const user = await req.user;
        const { companyId } = req.params;
        const q = {userId:user.id, companyId};
        // delete this company if it exists and is associated to this user and return 204
        const oldCompany = await deleteCompany(q);
        res.json(oldCompany);
    }
))

router.post('/:companyId/grant_permissions', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { companyId } = req.params;
      const { target, permissions } = await req.body;
      const toBeGranted = [];
      for(let p in permissions){
        const hasPermission = await hasPermissions(user.id, companyId, ['grant_'+p]);
        if(hasPermission)
          toBeGranted.push(p)
      }
      if(toBeGranted.length) {
        return res.json(await grantPermissions(target.id, companyId, toBeGranted));
      } else {
        throw new Boom('You do not have permission', {statusCode:401, payload:'Bad Monkey'});
      }
  }
))
router.post('/:companyId/revoke_permissions', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { companyId } = req.params;
      const { target, permissions } = await req.body;
      const toBeRevoked = [];
      for(let p in permissions){
        const hasPermission = await hasPermissions(user.id, companyId, ['revoke_'+p]);
        if(hasPermission)
          toBeGranted.push(p)
      }
      if(toBeRevoked.length)
        return res.json(await grantPermissions(target.id, companyId, toBeRevoked));
      else
        throw new Boom('You do not have permission', {statusCode:401, payload:'Bad Monkey'});
  }
))

router.post('/:companyId/enable_receive_sharing', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { companyId } = req.params;
      const hasPermission = await hasPermissions(user.id, companyId, ['spend'])
      if(hasPermission)
        return res.json(await makeSharingTarget(companyId));
      else
        throw new Boom('You do not have permission', {statusCode:401, payload:'Bad Monkey'});
  }
))
router.get('/:companyId/enable_receive_sharing', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { companyId } = req.params;
      const hasPermission = await hasPermissions(user.id, companyId, ['spend'])
      const r = {canShare:hasPermission}
      return res.json(r)
  }
))

router.delete('/:companyId/enable_receive_sharing', asyncWrapper(
  async (req,res) => {
      const user = await req.user;
      const { companyId } = req.params;
      const hasPermission = await hasPermissions(user.id, companyId, ['spend'])
      if(hasPermission)
        return res.json(await revokeSharingTarget(companyId));
      else
        throw new Boom('You do not have permission', {statusCode:401, payload:'Bad Monkey'});
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
      const user = await req.user;
      const userId = user.id;
      const { companyId } = req.params;
      const hasPermission = hasPermissions(user.id, companyId, ['viewItems','viewAll','viewer','employee']);
      if(!hasPermission){
        throw new Boom('Not Authorized to view this company', {statusCode: 401, payload:"No. Bad."})
      }
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
      const user = await req.user;
      const userId = user.id;
      const { companyId } = req.params;
      const hasPermission = hasPermissions(userId, companyId, ['viewAccounts', 'viewer']);
      if(!hasPermission){
        throw new Boom('Not Authorized to view this company', {statusCode: 401, payload:"No. Bad."})
      }
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
   * Retrieves all transactions associated with a single company.
   *
   * @param {string} companyId the ID of the user.
   * @returns {Object[]} an array of transactions
   */
  router.get(
    '/:companyId/transactions',
    asyncWrapper(async (req, res) => {
      const user = await req.user;
      const userId = user.id;
      const { companyId } = req.params;
      const hasPermission = hasPermissions(userId, companyId, ['viewTransactions', 'viewer']);
      if(!hasPermission){
        throw new Boom('Not Authorized to view this company', {statusCode: 401, payload:"No. Bad."})
      }
      const transactions = await retrieveTransactionsByCompanyId(companyId);

      if(transactions.length){
        updateRiskScore(companyId);
        res.json(sanitizeTransactions(transactions));
      } else {
        res.json([]);
      }
    })
  );

module.exports=router;
