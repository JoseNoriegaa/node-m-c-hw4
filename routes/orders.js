/**
 * Order
 * items [ product , quantity ]
 * user
 */

// Dependencies
const Util = require('util');
const data = require('../lib/data');
const helpers = require('../helpers');
const Tokens = require('../tokens');

const debug = Util.debuglog('orders');
const main = '/api/order';

/**
 * Returns the related functions to the orders
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  // Get the orders
  App.get(`${main}s`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        const orders = await data.list('orders', false);
        if (orders) {
          res.status(200).send(orders);
        } else {
          res.status(200).send([]);
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Get the orders related to a user
  App.get(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username of the user
        let { username } = req.queryString;
        username = typeof username === 'string' && username.trim()
          ? username.trim() : false;
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username) {
          const order = await data.read('orders', username);
          if (order) {
            const response = order;
            res.status(200).send(response);
          } else {
            res.status(404).send({ Error: 'Could not find any order.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Add item to the order
  App.post(`${main}/item`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username of the user
        let { username, productId, quantity } = req.body;
        username = typeof username === 'string' && username.trim()
          ? username.trim() : false;
        productId = typeof productId === 'string' && productId.trim()
          ? productId.trim() : false;
        if (quantity) {
          if (typeof quantity === 'string') {
            quantity = /[0-9]+$/.test(quantity.trim())
              ? parseInt(quantity.trim(), 10) : false;
          } else if (typeof quantity === 'number') {
            quantity = /[0-9]+$/.test(quantity) ? quantity : false;
          }
        }
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username && productId && quantity) {
          // get the product
          const product = await data.read('products', productId);
          if (product) {
            // Check if the order already exist, if not exist create a new one
            const order = await data.read('orders', username);
            if (order) {
              order.items.push({ product, quantity });
              const op = await data.update('orders', username, order);
              if (op) {
                res.status(200).send(order);
              } else {
                res.status(400).send({ Error: 'Could not add the new item to the order.' });
              }
            } else {
              const orderDetails = {
                user: username,
                items: [{ product, quantity }],
              };
              const op = await data.create('orders', username, orderDetails);
              if (op) {
                res.status(200).send(orderDetails);
              } else {
                res.status(400).send({ Error: 'Could not add the new item to the order.' });
              }
            }
          } else {
            res.status(400).send({ Error: 'The product does not exist.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // remove item to the order
  App.delete(`${main}/item`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username of the user
        let { username, productId } = req.body;
        username = typeof username === 'string' && username.trim()
          ? username.trim() : false;
        productId = typeof productId === 'string' && productId.trim()
          ? productId.trim() : false;
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username && productId) {
          // get the product
          const product = await data.read('products', productId);
          if (product) {
            // Check if the order already exist, if not exist create a new one
            const order = await data.read('orders', username);
            if (order) {
              order.items = order.items.filter(x => x.product.id != productId);
              if (order.items.length > 0) {
                await data.update('orders', username, order);
                res.status(200).send(order);
              } else {
                await data.delete('orders', username);
                res.status(204).send();
              }
            } else {
              res.status(400).send({ Error: 'Could not find any order.' });
            }
          } else {
            res.status(400).send({ Error: 'The product does not exist.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Delete the order
  App.delete(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username
        let { username } = req.queryString;
        // check if username a valid field
        username = typeof username === 'string' && username.trim()
          ? username.trim() : false;
        if (username) {
          // Validate
          const { user } = await Tokens.getToken(token);
          if (user === username) {
            // delete the order
            const op = await data.delete('orders', username);
            res.status(200).send({ operationSuccess: op });
          } else {
            res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields. Please provide the username.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Order payment
  App.post(`${main}/pay`, async (req, res) => {
    try {
      // validate the tokens in the headers
      const { token } = req.headers;
      let { stripesource: stripeSource } = req.headers;
      stripeSource = typeof stripeSource === 'string' && stripeSource.trim()
        ? stripeSource.trim() : false;
      const validToken = await Tokens.validateToken(token);
      if (validToken && stripeSource) {
        // Get the username
        let { username } = req.queryString;
        // check if username a valid field
        username = typeof username === 'string' && username.trim()
          ? username.trim() : false;
        if (username) {
          // Get the user data object
          const userData = await data.read('users', username);
          // Validate
          const { user } = await Tokens.getToken(token);
          if (user === userData.username) {
            // Get the order
            const order = await data.read('orders', username);
            if (order) {
              const description = 'Pizza delivery';
              const source = stripeSource;
              const amount = order.items
                .reduce((prev, x) => prev + (x.product.price * x.quantity), 0);
              helpers.stripeCharge(amount, 'usd', description, source, async (paymentErr, paymentDetails) => {
                if (!paymentErr && paymentDetails) {
                  const historyDetails = {
                    id: `${username}_${Date.now()}`,
                    order,
                    date: Date.now(),
                    payment_details: paymentDetails,
                  };
                  await data.create('history', historyDetails.id, historyDetails);
                  // delete the order
                  await data.delete('orders', username);
                  helpers.mailgun(userData.email, 'Pizza delivery', 'Your order has been processed', (mailgunErr, message) => {
                    res.status(200).send({
                      email: message,
                      error: !!mailgunErr,
                      errorMessage: mailgunErr,
                    });
                  });
                } else {
                  res.status(400).send({ Error: paymentErr });
                }
              });
            } else {
              res.status(400).send({ Error: 'Could not find any order.' });
            }
          } else {
            res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields. Please provide the username.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
};
