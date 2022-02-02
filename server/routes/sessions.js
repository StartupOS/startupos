const jwt = require('jsonwebtoken');

/**
 * @file Defines all routes for the Users route.
 */

const express = require('express');
const { retrieveUserByUsername } = require('../db/queries');
const { asyncWrapper } = require('../middleware');
const { sanitizeUsers } = require('../util');

const router = express.Router();

/**
 * Retrieves user information for a single user.
 *
 * @param {string} username the name of the user.
 * @returns {Object[]} an array containing a single user.
 */
router.post(
  '/',
  asyncWrapper(async (req, res) => {
    const { username } = req.body;
    const user = await retrieveUserByUsername(username);
    if (user != null) {
      res.json(sanitizeUsers(user));
    } else {
      res.json(null);
    }
  })
);

router.post(
  '/me',
  asyncWrapper(async (req, res) => {
    // const user = req.body;
    console.log('POST /me');
    let user = await req.user;
    console.log(user);
    try{
      if (user != null) {
        user.tiat = Date.now();
        const token = jwt.sign(user, 'BOTTOM_SECRET', {expiresIn:12*60*60});
        user.token=token;
        console.log(user);
        res.json(sanitizeUsers(user));
      } else {
        console.log('no match')
        res.json(null);
      }
    } catch (ex) {
      console.log(ex);
    }
    
  })
);

module.exports = router;
