/**
 * @file Defines all routes for the Users route.
 */
 const express = require('express');
 const Boom = require('@hapi/boom');
 const {
   retrieveUsers,
   deleteUsers,
   retrieveUserById,
 } = require('../db/queries');
 const { asyncWrapper } = require('../middleware');
 const { sanitizeUsers } = require('../util');

const plaid = require('../plaid');

const router = express.Router();

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

  module.exports=router;