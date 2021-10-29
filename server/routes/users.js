/**
 * @file Defines all routes for the Users route.
 */
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const qs = require('query-string');
const express = require('express');
const Boom = require('@hapi/boom');
const {
  retrieveUsers,
  retrieveUserByUsername,
  retrieveAccountsByUserId,
  createUser,
  deleteUsers,
  retrieveItemsByUser,
  retrieveTransactionsByUserId,
  retrieveUserById,
} = require('../db/queries');
const { asyncWrapper } = require('../middleware');
const {
  sanitizeAccounts,
  sanitizeItems,
  sanitizeUsers,
  sanitizeTransactions,
} = require('../util');

const router = express.Router();

const plaid = require('../plaid');
const { createLinkedInUser } = require('../db/queries/users');

/**
 * Retrieves all users.
 *
 * @returns {Object[]} an array of users.
 */
router.get(
  '/',
  asyncWrapper(async (req, res) => {
    const users = await retrieveUsers();
    res.json(sanitizeUsers(users));
  })
);

/**
 * Creates a new user (unless the username is already taken).
 *
 * @TODO make this return an array for consistency.
 *
 * @param {string} username the username of the new user.
 * @returns {Object[]} an array containing the new user.
 */
router.post(
  '/',
  asyncWrapper(async (req, res) => {
    const { username } = req.body;
    const usernameExists = await retrieveUserByUsername(username);
    // prevent duplicates
    if (usernameExists)
      throw new Boom('Username already exists', { statusCode: 409 });
    const newUser = await createUser(username);
    res.json(sanitizeUsers(newUser));
  })
);

/** 
 * Exhange a code for LI user profile
 * @param {string} code the authorization code received by the client
 * @returns {Object} The constructed user profile
*/
router.get('/LinkedInCode',asyncWrapper(async (req,res)=>{
  console.log(req.query);
  let user = null;
  const code = req.query.code;
  const accessToken = await getAccessToken(code);
  console.log(1)
  console.log(accessToken)
  const userProfile = await getUserProfile(accessToken);
  console.log(2)
  console.log(userProfile);
  const userEmail = await getUserEmail(accessToken);
  console.log(3)
  console.log(userEmail);
  console.log('retrieved bullshit');
  let resStatus = 400;
  let userFound = false;
  let retJSON = {};
  let existingUser = null;
  if(!(accessToken === null || userProfile === null || userEmail === null)) {
    console.log('in conditional');
    user = userBuilder(userProfile, userEmail);
    console.log('before attempting to log user')
    console.log(user);
    resStatus = 200;
    try {
      existingUser = await retrieveUserByUsername(user.email);
      userFound = !!existingUser
    } catch (err){
      console.log('New User');
      console.log(err);
    }
    console.log('last line');
    console.log(userFound);
    if(userFound){
      console.log(existingUser);
      retJSON = existingUser;
    } else {
      try {
        retJSON = await createLinkedInUser(user);
      } catch (err) {
        console.log(err);
      }
    }
    console.log(retJSON);
    const token = jwt.sign(retJSON, 'BOTTOM_SECRET');
    retJSON.token = token;
  }
  res.status(resStatus).json(retJSON);
}));

// Constants
const urlToGetLinkedInAccessToken = 'https://www.linkedin.com/oauth/v2/accessToken';
const urlToGetUserProfile ='https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))'
const urlToGetUserEmail = 'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))';

/**
 * Get access token from LinkedIn
 * @param code returned from step 1
 * @returns accessToken if successful or null if request fails 
 */
async function getAccessToken(code) {
  // let accessToken = null;
  console.log('1.1')
  
  // LINKEDIN_CLIENT_SECRET
  // LINKEDIN_CLIENT_ID
  // LINKEDIN_OAUTH_REDIRECT
  // LINKEDIN_OAUTH_URL
  // LINKEDIN_SCOPE
  // LINKEDIN_STATE

  const parameters = {
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": process.env.LINKEDIN_OAUTH_REDIRECT,
    "client_id": process.env.LINKEDIN_CLIENT_ID,
    "client_secret": process.env.LINKEDIN_CLIENT_SECRET,
  };
  console.log(parameters);
  console.log('1.2')
  const url = urlToGetLinkedInAccessToken+"?"+qs.stringify(parameters);
  console.log(url);
  const response = await fetch(url, {
    method: 'post',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  });
  console.log('1.3');
  const data = await response.json();
  console.log(data);
  const accessToken = data["access_token"];
  return accessToken;
}

/**
 * Get user first and last name and profile image URL
 * @param accessToken returned from step 2
 */
async function getUserProfile(accessToken) {
  let userProfile = {};
  const response = await fetch(urlToGetUserProfile, {
    method: 'get',
    headers: {"Authorization": `Bearer ${accessToken}`}
  });
  const data = await response.json();
  userProfile.firstName = data["localizedFirstName"];
  userProfile.lastName = data["localizedLastName"];
  userProfile.profileImageURL = data.profilePicture["displayImage~"].elements[0].identifiers[0].identifier;
  return userProfile;
}


/**
 * Get user email
 * @param accessToken returned from step 2
 */
async function getUserEmail(accessToken) {
  const response = await fetch(urlToGetUserEmail, {
    method: 'get',
    headers: {"Authorization": `Bearer ${accessToken}`}
  });
  const data = await response.json();
  const email = data.elements[0]["handle~"].emailAddress;

  return email;
}

/**
 * Build User object
 */
function userBuilder(userProfile, userEmail) {
  console.log('in userBuilder');
  const retObj = {
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    profileImageURL: userProfile.profileImageURL,
    email: userEmail
  }
  console.log(retObj);
  return retObj;
}


/**
 * Retrieves user information for a single user.
 *
 * @param {string} userId the ID of the user.
 * @returns {Object[]} an array containing a single user.
 */
router.get(
  '/:userId',
  asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const user = await retrieveUserById(userId);
    res.json(sanitizeUsers(user));
  })
);

/**
 * Retrieves all items associated with a single user.
 *
 * @param {string} userId the ID of the user.
 * @returns {Object[]} an array of items.
 */
router.get(
  '/:userId/items',
  asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const items = await retrieveItemsByUser(userId);
    res.json(sanitizeItems(items));
  })
);

/**
 * Retrieves all accounts associated with a single user.
 *
 * @param {string} userId the ID of the user.
 * @returns {Object[]} an array of accounts.
 */
router.get(
  '/:userId/accounts',
  asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const accounts = await retrieveAccountsByUserId(userId);
    res.json(sanitizeAccounts(accounts));
  })
);

/**
 * Retrieves all transactions associated with a single user.
 *
 * @param {string} userId the ID of the user.
 * @returns {Object[]} an array of transactions
 */
router.get(
  '/:userId/transactions',
  asyncWrapper(async (req, res) => {
    const { userId } = req.params;
    const transactions = await retrieveTransactionsByUserId(userId);
    res.json(sanitizeTransactions(transactions));
  })
);

/**
 * Deletes a user and its related items
 *
 * @param {string} userId the ID of the user.
 */
router.delete(
  '/:userId',
  asyncWrapper(async (req, res) => {
    const { userId } = req.params;

    // removes all items from Plaid services associated with the user. Once removed, the access_token
    // associated with an Item is no longer valid and cannot be used to
    // access any data that was associated with the Item.

    // @TODO wrap promise in a try catch block once proper error handling introduced
    const items = await retrieveItemsByUser(userId);
    await Promise.all(
      items.map(({ plaid_access_token: token }) =>
        plaid.itemRemove({ access_token: token })
      )
    );

    // delete from the db
    await deleteUsers(userId);
    res.sendStatus(204);
  })
);

module.exports = router;
