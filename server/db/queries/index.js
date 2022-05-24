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
  createLinkedInUser,
  updateUser
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
  setRiskScore,
  getOwnedOrg,
  hasPermissions,
  grantPermissions,
  grantPermissionsToOrg,
  revokePermissions,
  revokePermissionsFromOrg,
  makeSharingTarget,
  revokeSharingTarget,
  listFunders,
  companiesWithPermissions,
  retrieveCompaniesSharingWithMe,
  retrieveCompaniesIShareWith,
} = require('./companies');

const {
  createMergeToken,
  retrieveMergeTokens
} = require('./merge');

const {
  upsertEmployees,
  listEmployees,
  retrieveEmployee
} = require('./employees');

const {
  getMessages,
  createMessage,
  retrieveMessage,
  updateMessage,
  deleteMessage
} = require('./messages');

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
  createLinkedInUser,
  updateUser,
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
  makeSharingTarget,
  revokeSharingTarget,
  getOwnedOrg,
  setRiskScore,
  hasPermissions,
  grantPermissions,
  grantPermissionsToOrg,
  revokePermissions,
  revokePermissionsFromOrg,
  listFunders,
  companiesWithPermissions,
  retrieveCompaniesSharingWithMe,
  retrieveCompaniesIShareWith,
  // institutions
  listUsedInstitutions,
  updateInstitution,
  // Merge Account Tokens
  createMergeToken,
  retrieveMergeTokens,
  // Employees
  upsertEmployees,
  listEmployees,
  retrieveEmployee,
  // Messages
  getMessages,
  createMessage,
  retrieveMessage,
  updateMessage,
  deleteMessage
};
