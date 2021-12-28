/**
 * @file Defines all routes for the Accounts route.
 */

const express = require('express');
const { retrieveTransactionsByAccountId, deleteAccountById, unDeleteAccountById } = require('../db/queries');
const { asyncWrapper } = require('../middleware');
const { sanitizeTransactions, sanitizeAccounts } = require('../util');

const router = express.Router();

/**
 * Fetches all transactions for a single account.
 *
 * @param {number} accountId the ID of the account.
 * @return {Object{[]}} an array of transactions
 */
router.get(
  '/:accountId/transactions',
  asyncWrapper(async (req, res) => {
    const { accountId } = req.params;
    const transactions = await retrieveTransactionsByAccountId(accountId);
    res.json(sanitizeTransactions(transactions));
  })
);

router.delete(
  '/:accountId',
  asyncWrapper(async (req, res) => {
    const user = await req.user;
    const { accountId } = req.params;
    const q = {userId: user.id, accountId}
    const accounts = await deleteAccountById(q);
    res.json(sanitizeAccounts(accounts));
  })
);

router.post(
  '/:accountId',
  asyncWrapper(async (req, res) => {
    const user = await req.user;
    const { accountId } = req.params;
    const q = {userId: user.id, accountId}
    const accounts = await unDeleteAccountById(q);
    res.json(sanitizeAccounts(accounts));
  })
);

module.exports = router;
