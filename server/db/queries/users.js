/**
 * @file Defines the queries for the users table/views.
 */

const db = require('../');

/**
 * Creates a single user.
 *
 * @param {string} username the username of the user.
 * @returns {Object} the new user.
 */
const createUser = async username => {
  const query = {
    // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
    text: 'INSERT INTO users_table (username) VALUES ($1) RETURNING *;',
    values: [username],
  };
  const { rows } = await db.query(query);
  return rows[0];
};

/**
 * Creates a LinkedIn user.
 *
 * @param {Object} user the username of the user.
 * type User = {
    firstName: string
    lastName: string
    email: string
    profileImageURL: string
}
 * @returns {Object} the new user.
 */


 const createLinkedInUser = async (userobj) => {
  const {firstName, lastName, email, picture} = userobj;
  const username = email;
  const query = {
    // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
    text: 'INSERT INTO users_table (username, given_name, family_name, email, picture, _json) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
    values: [username, firstName, lastName, email, picture, JSON.stringify(userobj)],
  };
  try { 
    const { rows } = await db.query(query);
    console.log(rows);
    return rows[0];
  } catch (err) {
    console.log(err);
    throw new Error("Don't wind up here.")
  }

  
};

/**
 * Removes users and related items, accounts and transactions.
 *
 *
 * @param {string[]} userId the desired user to be deleted.
 */

const deleteUsers = async userId => {
  const query = {
    text: 'DELETE FROM users_table WHERE id = $1;',
    values: [userId],
  };
  await db.query(query);
};

/**
 * Retrieves a single user.
 *
 * @param {number} userId the ID of the user.
 * @returns {Object} a user.
 */
const retrieveUserById = async userId => {
  const query = {
    text: 'SELECT * FROM users WHERE id = $1',
    values: [userId],
  };
  const { rows } = await db.query(query);
  // since the user IDs are unique, this query will return at most one result.
  return rows[0];
};

/**
 * Retrieves a single user.
 *
 * @param {string} username the username to search for.
 * @returns {Object} a single user.
 */
const retrieveUserByUsername = async username => {
  console.log('in retrieve user by name');
  if(!username){
    throw new Error('Username cannot be undefined');
  }
  const query = {
    text: 'SELECT * FROM users WHERE username = $1',
    values: [username],
  };
  let users =[];
  console.log(query);
  try {
    const resp = await db.query(query);
    // console.log(resp);
    users = resp.rows;
  } catch (e) {
    console.log(e);
  }
  // the username column has a UNIQUE constraint, so this will never return more than one row.
  console.log(users);
  return users[0];
};

/**
 * Retrieves all users.
 *
 * @returns {Object[]} an array of users.
 */
const retrieveUsers = async () => {
  const query = {
    text: 'SELECT * FROM users',
  };
  const { rows: users } = await db.query(query);
  return users;
};

const updateUser = async (user)=>{
  const {firstName, lastName, email, picture} = user;
  console.log(email)
  console.log('in update user');
  if(!email){
    throw new Error('Username cannot be undefined');
  }
  const query = {
    text: `
    update users_table 
    set
      given_name=$2, 
      family_name=$3, 
      email=$1, 
      picture=$4, 
      _json=$5
    WHERE username = $1
    returning *`,
    values: [email, firstName, lastName, picture, JSON.stringify(user)],
  };
  let users =[];
  console.log(query);
  try {
    const resp = await db.query(query);
    // console.log(resp);
    users = resp.rows;
  } catch (e) {
    console.error('THERE WAS A FIREFIGHT');
    console.log(e);
  }
  // the username column has a UNIQUE constraint, so this will never return more than one row.
  console.log(users);
  return users[0];
}

module.exports = {
  createUser,
  createLinkedInUser,
  deleteUsers,
  retrieveUserById,
  retrieveUserByUsername,
  retrieveUsers,
  updateUser
};
