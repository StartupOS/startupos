const isArray = require('lodash/isArray');
const pick = require('lodash/pick');

/**
 * Wraps input in an array if needed.
 *
 * @param {*} input the data to be wrapped in array if needed.
 * @returns {*[]} an array based on the input.
 */
const toArray = input => (isArray(input) ? [...input] : [input]);

/**
 * Returns an array of objects that have only the given keys present.
 *
 * @param {(Object|Object[])} input a single object or an array of objects.
 * @param {string[]} keysToKeep the keys to keep in the sanitized objects.
 */
const sanitizeWith = (input, keysToKeep) => {
  if (!input || input.length === 0 ){
    return [];
  } else {
    return toArray(input).map(obj => pick(obj, keysToKeep));
  }
}
/**
 * Returns an array of sanitized accounts.
 *
 * @param {(Object|Object[])} accounts a single account or an array of accounts.
 */
const sanitizeAccounts = accounts =>
  sanitizeWith(accounts, [
    'id',
    'item_id',
    'organization_id',
    'name',
    'mask',
    'official_name',
    'current_balance',
    'available_balance',
    'iso_currency_code',
    'unofficial_currency_code',
    'type',
    'subtype',
    'created_at',
    'updated_at',
    'logo',
    'primary_color',
    'deleted'
  ]);

/**
 * Returns an array of sanitized items.
 *
 * @param {(Object|Object[])} items a single item or an array of items.
 */
const sanitizeItems = items =>
  sanitizeWith(items, [
    'id',
    'organization_id',
    'plaid_institution_id',
    'status',
    'created_at',
    'updated_at',
  ]);

/**
 * Returns an array of sanitized users.
 *
 * @param {(Object|Object[])} users a single user or an array of users.
 */
const sanitizeUsers = users =>
  sanitizeWith(users, ['id', 'username', 'created_at', 'updated_at', 'picture', 'email', 'given_name', 'family_name']);

/**
 * Returns an array of transactions
 *
 * @param {(Object|Object[])} transactions a single transaction of an array of transactions.
 */
const sanitizeTransactions = transactions =>
  sanitizeWith(transactions, [
    'id',
    'account_id',
    'item_id',
    'organization_id',
    'name',
    'type',
    'date',
    'category',
    'amount',
    'created_at',
    'updated_at',
    'merchant'
  ]);

const validItemStatuses = new Set(['good', 'bad']);
const isValidItemStatus = status => validItemStatuses.has(status);

const quote = (s)=>{
  let o = '"';
  for(let c in s){
    switch(c){
      case '"':
        o+='\"';
        break;
      case '\\':
        o+='\\\\'
        break;
      default:
        o+=c
    }
  }
  o+='"';
  return o;
}

/**********************
 * Enhanced Logger
 * 
 * @param {String} s what to write to the log
 *********************/
const clog = async (s)=>{
  const t = new Date();
  console.log(t,',', quote(s));

}

module.exports = {
  toArray,
  sanitizeAccounts,
  sanitizeItems,
  sanitizeUsers,
  sanitizeTransactions,
  validItemStatuses,
  isValidItemStatus,
  clog
};
