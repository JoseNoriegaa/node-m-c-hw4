/**
 * User properties
 * username
 * email
 * fullname
 * password
 * address
 */
// Dependencies
const util = require('util');
const data = require('../lib/data');
const helpers = require('../helpers');

const debug = util.debuglog('users');
const main = '/api/user';

/**
 * Returns the routes related to the users
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  // Get the users
  App.get(`${main}s`, async (req, res) => {
    try {
      const users = await data.list('users', false);
      if (users) {
        // remove the password
        const response = users;
        for (let i = 0; i < response.length; i++) {
          delete response[i].password;
        }
        res.status(200).send(response);
      } else {
        res.status(200).send([]);
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Get a specific user
  App.get(`${main}`, async (req, res) => {
    try {
      // Get the username
      let { username } = req.queryString;
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      if (username) {
        const user = await data.read('users', username);
        if (user) {
          const response = user;
          delete response.password;
          res.status(200).send(response);
        } else {
          res.status(404).send({ Error: 'Could not find the specified user.' });
        }
      } else {
        res.status(400).send({ Error: 'Missing required fields.' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Create a new user
  App.post(`${main}`, async (req, res) => {
    try {
      // Get the user data
      let {
        username,
        email,
        fullname,
        password,
        address,
      } = req.body;
      // Validate the parameters
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      email = typeof email === 'string' && helpers.isAnEmail(email.trim())
        ? email.trim() : false;
      fullname = typeof fullname === 'string' && fullname.trim()
        ? fullname.trim() : false;
      password = typeof password === 'string' && password.trim()
        ? password.trim() : false;
      address = typeof address === 'string' && address.trim()
        ? address.trim() : false;
      if (username && email && fullname && password && address) {
        const passwordHash = helpers.hash(password);
        const user = {
          username,
          email,
          fullname,
          password: passwordHash,
          address,
        };
        // create the user
        const op = await data.create('users', user.username, user);
        res.status(201).send({ operationSuccess: op });
      } else if (!username) {
        res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid username.' });
      } else if (!email) {
        res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid email.' });
      } else if (!fullname) {
        res.status(400).send({ Error: 'There are missing or invalid fields. Please provide the "fullname".' });
      } else if (!password) {
        res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a password.' });
      } else if (!address) {
        res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid address.' });
      } else {
        res.status(400).send({ Error: 'There are missing or invalid fields.' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Update a specified user by the username
  App.put(`${main}`, async (req, res) => {
    try {
      // Get the user data
      let { username } = req.queryString;
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      let {
        email,
        fullname,
        password,
        address,
      } = req.body;
      // Validate the parameters
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      email = typeof email === 'string' && helpers.isAnEmail(email.trim())
        ? email.trim() : false;
      fullname = typeof fullname === 'string' && fullname.trim()
        ? fullname.trim() : false;
      password = typeof password === 'string' && password.trim()
        ? password.trim() : false;
      address = typeof address === 'string' && address.trim()
        ? address.trim() : false;
      // Get the data-object of the current item
      const user = await data.read('users', username);
      if (user) {
        // check if at least one parameter is valid
        if (email || fullname || password || address) {
          // Count the affected fields
          let counter = 0;
          if (fullname && fullname !== user.fullname) {
            user.fullname = fullname;
            counter++;
          }
          if (email && email !== user.email) {
            user.email = email;
            counter++;
          }
          if (password && helpers.hash(password) !== user.password) {
            user.password = helpers.hash(password);
            counter++;
          }
          if (address && address !== user.address) {
            user.address = address;
            counter++;
          }
          // Store the new user data
          const op = await data.update('users', username, user);
          res.status(200).send({ operationSuccess: op, affectedFields: counter });
        } else {
          res.status(400).send({ Error: 'There are not fields to update.' });
        }
      } else {
        res.status(400).send({ Error: 'Could not find the user.' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Delete a specific user
  App.delete(`${main}`, async (req, res) => {
    try {
      // Get the username
      let { username } = req.queryString;
      // check if username is a valid fieldç
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      if (username) {
        // delete the user
        const op = await data.delete('users', username);
        res.status(200).send({ operationSuccess: op });
      } else {
        res.status(400).send({ Error: 'Missing required fields. Please provide the username.' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // TODO: Create a stripe token with credit card
  App.post(`${main}/stripe/token`, async (req, res) => {
    try {
      // Get the username
      const { username } = req.queryString;
      // Get credit card info
      const { number, expMonth, expYear, cvc } = req.body;
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        const userData = await Tokens.getToken(token);
        if (userData.user === username) {
          if (number && expMonth && expYear && cvc) {
            helpers.stripeToken(number, expMonth, expYear, cvc, (err, data) => {
              console.log({data, err});
              if (data && !err) {
                // Something
              } else {
                res.status(500).send({ Error: 'Something went wrong.' });
              }
            });
          } else {
            res.status(400).send({ Error: 'Missing required fields.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields. Please provide the username.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (error) {
      debug(error);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
};
