/**
 * Order
 * items [ product , quantity ]
 * usera
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../helpers');
const Util = require('util');
const debug = Util.debuglog('orders');
const Tokens = require('../tokens');
const main = '/order';
/**
 * Returns all related functions to the orders
 * @param {Object} App Server instance 
 */
module.exports = (App) => {
  // Get all orders
  App.get(`${main}s`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        const orders = await _data.list('orders', false);
        if (orders) {
          res.status(200).send(orders);
        } else {
          res.status(200).send([]);
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
    }
  });
  // Get all orders related to a user
  App.get(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username of the user
        let { username } = req.queryString;
        username = typeof username === 'string' && username.trim() ?
        username.trim() : false;
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username) {
          const order = await _data.read('orders', username);
          if (order) {
            let response = order;
            res.status(200).send(response);
          } else {
            res.status(404).send({Error: 'Could not find any order'});
          }
        } else {
          res.status(400).send({Error: 'Missing required fields'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
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
        username = typeof username === 'string' && username.trim() ?
        username.trim() : false;
        productId = typeof productId === 'string' && productId.trim() ?
        productId.trim() : false;
        if (quantity) {
          if (typeof quantity === 'string') {
            quantity = /[0-9]+$/.test(quantity.trim()) ?
            parseInt(quantity.trim()) : false;
          } else if (typeof quantity === 'number') {
            quantity = /[0-9]+$/.test(quantity) ?
            quantity : false;
          }
        }
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username && productId && quantity) {
          // get the product
          const product = await _data.read('products', productId);
          if (product) {
            // Check if the order already exist, if not exist create a new one 
            let order = await _data.read('orders', username);
            if (order) {
              order.items.push({product, quantity });
              const op = await _data.update('orders', username, order);
              if (op) {
                res.status(200).send(order);
              } else {
                res.status(400).send({ Error: 'Could not add the new item to the order' });
              }
            } else {
              const orderDetails = {
                user: username,
                items: [{ product, quantity }],
              };
              const op = await _data.create('orders', username, orderDetails);
              if (op) {
                res.status(200).send(orderDetails);
              } else {
                res.status(400).send({ Error: 'Could not add the new item to the order' });
              }
            }
          } else {
            res.status(400).send({ Error: 'The specified product does not exist' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields' });
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
    }
  });
  // remove item to the order, 
  App.delete(`${main}/item`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the username of the user
        let { username, productId } = req.body;
        username = typeof username === 'string' && username.trim() ?
        username.trim() : false;
        productId = typeof productId === 'string' && productId.trim() ?
        productId.trim() : false;
        const { user } = await Tokens.getToken(token);
        username = username === user ? username : false;
        if (username && productId && quantity) {
          // get the product
          const product = await _data.read('products', productId);
          if (product) {
            // Check if the order already exist, if not exist create a new one 
            let order = await _data.read('orders', username);
            if (order) {
              order.items = order.items.filter(x => x.id === productId);
              if (order.items.length > 0) {
                const op = await _data.update('orders', username, order);
                res.status(200).send(order);
              } else {
                const op = await _data.delete('orders', username);
                res.status(204).send();
              }
            } else {
              res.status(400).send({ Error: 'Could not find any order' });
            }
          } else {
            res.status(400).send({ Error: 'The specified product does not exist' });
          }
        } else {
          res.status(400).send({ Error: 'Missing required fields' });
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
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
        // Verify if username a valid field
        username = typeof username === 'string' && username.trim() ?
        username.trim() : false;
        if (username) {
          // Validate
          const { user } = await Tokens.getToken(token);
          if (user === username) {
            // delete the order
            const op = await _data.delete('orders', username);
            res.status(200).send({ operationSuccess: op });
          } else {
            res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
          }
        } else {
          res.status(400).send({Error: 'Missing required fields, please provide the username'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
    }
  });
  // Order payment
  App.post(`${main}/pay`, async (req, res) => {
    try {
      // validate the tokens in the headers
      let { token, strp_source } = req.headers;
      strp_source = typeof strp_source === 'string' && strp_source.trim() ?
      strp_source.trim() : false;
      const validToken = await Tokens.validateToken(token);
      if (validToken && strp_source) {
        // Get the username
        let { username } = req.queryString;
        // Verify if username a valid field
        username = typeof username === 'string' && username.trim() ?
        username.trim() : false;
        if (username) {
          // Get the user data object
          const userData = await _data.read('users', username);
          // Validate
          const { user } = await Tokens.getToken(token);
          if (user === userData.username) {
            // Get the order
            const order = await _data.read('orders', username);
            if (order) {
              let amount = 0;
              const description = 'Pizza delivery';
              const source = strp_source;
              order.items.map(x => {amount += x.product.price * x.quantity});
              helpers.stripeChange(amount, 'usd', description, source, async (err, data) => {
                if (!err && data) {
                  const historyDetails = {
                    id: username + '_' + Date.now(),
                    order,
                    date: Date.now(),
                    payment_details: data,
                  };
                  const op = await _data.create('history', historyDetails.id, historyDetails);
                  // delete the order
                  await _data.delete('orders', username);
                  helpers.mailgun(userData.email, 'Pizza delivery', 'Your order has been processed', (err, message, code) => {
                    res.status(200).send({ email: message });
                  });
                } else {
                  res.status(400).send({ Error: err });
                }
              });
            } else {
              res.status(400).send({ Error: 'Could not find any order' });
            }
          } else {
            res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
          }
        } else {
          res.status(400).send({Error: 'Missing required fields, please provide the username'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch(e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });      
    }
  });
};
