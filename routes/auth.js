// Dependencies
const util = require('util');
const helpers = require('../helpers');
const data = require('../lib/data');
const Tokens = require('../tokens');

const debug = util.debuglog('auth');
const main = '/api/auth';

/**
 * Returns all routes related to authentification
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  App.post(`${main}/login`, async (req, res) => {
    try {
      // Get all required fields
      let { username, password } = req.body;
      if (typeof username === 'string' && typeof password === 'string') {
        // Verify that the provided parameters are valid
        username = username.trim() ? username.trim() : false;
        password = username.trim() ? password : false;
        if (username && password) {
          // Get the user data
          const user = await data.read('users', username);
          if (user) {
            const pwdHash = helpers.hash(password);
            const match = pwdHash === user.password;
            if (match) {
              // Create a token
              const token = await Tokens.createToken(user);
              if (token) {
                res.status(200).send({ token });
              } else {
                res.status(400).send({ Error: 'Could not create the token' });
              }
            } else {
              res.status(400).send({ Error: 'Invalid credentials' });
            }
          } else {
            res.status(400).send({ Error: 'Could not find the specified user' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields, please provide the username and password' });
        }
      } else {
        res.status(400).send({ Error: 'Missing required fields, please provide the username and password' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
  App.post(`${main}/logout`, async (req, res) => {
    try {
      // Get the token and destroy it
      let { token } = req.headers;
      // Validate all parameters
      token = typeof token === 'string' && token.trim()
        ? token.trim() : false;
      if (token) {
        const op = await Tokens.deleteToken(token);
        if (op) {
          res.status(200).send({ operationSuccess: op });
        } else {
          res.status(400).send({ Error: 'Could not delete the token' });
        }
      } else {
        res.status(400).send({ Error: 'Could not find the token in the headers' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
};
