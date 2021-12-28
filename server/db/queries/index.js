/**
 * @file Exports the queries for interacting with the database.
 */
const {
  listUsedInstitutions,
  updateInstitution
} = require('./institutions');
const {
  createAccounts,
  retrieveAccountByPlaidAccountId,
  retrieveAccountsByItemId,
  unDeleteAccountById,
  deleteAccountById
} = require('./accounts');
const {
  createItem,
  deleteItem,
  retrieveItemById,
  retrieveItemByPlaidAccessToken,
  retrieveItemByPlaidInstitutionId,
  retrieveItemByPlaidItemId,
  updateItemStatus,
} = require('./items');
const { createPlaidApiEvent } = require('./plaidApiEvents');
const {
  createTransactions,
  retrieveTransactionsByAccountId,
  retrieveTransactionsByItemId,
  retrieveTransactionsInDateRange,
  deleteTransactions,
} = require('./transactions');
const {
  createUser,
  deleteUsers,
  retrieveUsers,
  retrieveUserById,
  retrieveUserByUsername,
} = require('./users');
const { createLinkEvent } = require('./linkEvents');

const {
  createAsset,
  retrieveAssetsByCompany,
  deleteAssetByAssetId,
} = require('./assets');

const {
  createCompany,
  listCompanies,
  retrieveCompany,
  updateCompany,
  deleteCompany,
  retrieveTransactionsByCompanyId,
  retrieveItemsByCompany,
  retrieveAccountsByCompanyId,
  updateSharing,
  getOwnedOrg
} = require('./companies');

module.exports = {
  // accounts
  createAccounts,
  retrieveAccountByPlaidAccountId,
  retrieveAccountsByItemId,
  deleteAccountById,
  unDeleteAccountById,
  // items
  createItem,
  deleteItem,
  retrieveItemById,
  retrieveItemByPlaidAccessToken,
  retrieveItemByPlaidInstitutionId,
  retrieveItemByPlaidItemId,
  updateItemStatus,
  // plaid api events
  createPlaidApiEvent,
  // transactions
  createTransactions,
  retrieveTransactionsByAccountId,
  retrieveTransactionsByItemId,
  retrieveTransactionsInDateRange,
  deleteTransactions,
  // users
  createUser,
  deleteUsers,
  retrieveUserById,
  retrieveUserByUsername,
  retrieveUsers,
  // assets
  createAsset,
  retrieveAssetsByCompany,
  deleteAssetByAssetId,
  // link events
  createLinkEvent,
  // companies
  createCompany,
  listCompanies,
  retrieveCompany,
  updateCompany,
  deleteCompany,
  retrieveTransactionsByCompanyId,
  retrieveItemsByCompany,
  retrieveAccountsByCompanyId,
  updateSharing,
  getOwnedOrg,
  // institutions
  listUsedInstitutions,
  updateInstitution
};
