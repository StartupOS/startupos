/**
 * @file Defines all routes for the Users route.
 */
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const qs = require('query-string');
const express = require('express');
const Boom = require('@hapi/boom');
const {
  retrieveUserByUsername,
  createLinkedInUser,
} = require('../db/queries');
const { asyncWrapper } = require('../middleware');

const router = express.Router();


/** 
 * Exhange a code for LI user profile
 * @param {string} code the authorization code received by the client
 * @returns {Object} The constructed user profile
*/
const codes = {};

router.get('/LinkedInCode',asyncWrapper(async (req,res)=>{
  console.log('in /LinkedInCode');
  console.log(req.query);
  let user = null;
  let resStatus = 400;
  let userFound = false;
  let retJSON = {};
  let existingUser = null;
  const code  = req.query.code;
 
  console.log('\n\n\n\nCODE:');
  console.log(code);
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
  
  if(!(accessToken === null || userProfile === null || userEmail === null)|| codes[code]) {
    console.log('in conditional');
    codes[code]=true;
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
    retJSON.tiat = Date.now();
    const token = jwt.sign(retJSON, 'BOTTOM_SECRET');
    retJSON.token = token;
    codes[code] = token;
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
  console.log('1.1')
  if(codes[code]){
    if(codes[code] === true ){
      throw new Error('Narp narp narp')
    } else {
      return codes[code]
    }
  }
  codes[code]=true;

  const parameters = {
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": process.env.LINKEDIN_OAUTH_REDIRECT,
    "client_id": process.env.LINKEDIN_CLIENT_ID,
    "client_secret": process.env.LINKEDIN_CLIENT_SECRET,
    "scope": process.env.LINKEDIN_SCOPE,
    "state": process.env.LINKEDIN_STATE
  };
  console.log(parameters);
  console.log('1.2')
  const url = urlToGetLinkedInAccessToken+"?"+qs.stringify(parameters);
  console.log(url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  });
  console.log('1.3');
  const data = await response.json();
  console.log(data);
  const accessToken = data["access_token"];
  codes[code]=accessToken;
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
    picture: userProfile.profileImageURL,
    email: userEmail
  }
  console.log(retObj);
  return retObj;
}

module.exports = router;
