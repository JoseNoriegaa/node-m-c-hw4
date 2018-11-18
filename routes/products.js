/**
 * Product properties
 * id
 * name
 * description
 * cost
 * currency
 * urlImage
 */
const main = '/product';
// Dependecies
const _data = require('../lib/data');
const helpers = require('../helpers');
const util = require('util');
const debug = util.debuglog('products');
const Tokens = require('../tokens');
/**
 * Returns all functions related to the products
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  // Get all items
  App.get(`${main}s`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        const products = await _data.list('products', false);
        if (products) {
          res.status(200).send(products);
        } else {
          res.status(200).send([]);
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
  // Get a specified item by the id
  App.get(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the id
        let { id } = req.queryString;
        id = typeof id === 'string' && id.trim() ?
        id.trim() : false;
        if (id) {
          const product = await _data.read('products', id);
          if (product) {
            let response = product;
            res.status(200).send(response);
          } else {
            res.status(404).send({Error: 'Could not find the specified product'});
          }
        } else {
          res.status(400).send({Error: 'Missing required fields'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
  // Create a new item
  App.post(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the product data
        let { name, cost, description, currency, urlImage } = req.body;
        // Validate all parameters
        name = typeof name === 'string' && name.trim() ?
        name.trim().toLocaleLowerCase() : false;
        cost = typeof cost === 'string' && /^[0-9]+.?[0-9]+$/.test(cost.trim()) ? 
        cost.trim().toLocaleLowerCase() : false;
        currency = typeof currency === 'string' && ['usd', 'mxn'].indexOf(currency.trim().toLocaleLowerCase()) > -1 ?
        currency.trim().toLocaleLowerCase() : false;
        description = typeof description === 'string' && description.trim() ? 
        description.trim().toLocaleLowerCase() : false;
        urlImage = typeof urlImage === 'string' && urlImage.trim() ?
        urlImage.trim().toLocaleLowerCase() : false;
        if (name && cost && description && currency && urlImage) {
          const id = helpers.createRandomString(20);
          const product = {
            id,
            name,
            cost,
            description,
            currency,
            urlImage,
          };
          // create the product
          const op = await _data.create('products', product.id, product);
          res.status(201).send({ operationSuccess: op, item: product });
        } else {
          if (!name) {
            res.status(400).send({Error: 'There are missing or invalid fields, please provide a valid name'});
          } else if (!cost) {
            res.status(400).send({Error: 'There are missing or invalid fields, please provide a valid cost'});
          }  else if (!description) {
            res.status(400).send({Error: 'There are missing or invalid fields, please provide the description'});
          } else if (!currency) {
            res.status(400).send({Error: 'There are missing or invalid fields, please provide a currency'});
          } else {
            res.status(400).send({Error: 'There are missing or invalid fields'});
          }
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
  // Update a specified item by the id
  App.put(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the item data
        let { id } = req.queryString;
        let { name, cost, description, currency, urlImage } = req.body;
        // Validate all parameters
        name = typeof name === 'string' && name.trim() ?
        name.trim().toLocaleLowerCase() : false;
        cost = typeof cost === 'string' && /^[0-9]+.?[0-9]+$/.test(cost.trim()) ? 
        cost.trim().toLocaleLowerCase() : false;
        currency = typeof currency === 'string' && ['usd', 'mxn'].indexOf(currency.trim().toLocaleLowerCase()) > -1 ?
        currency.trim().toLocaleLowerCase() : false;
        description = typeof description === 'string' && description.trim() ? 
        description.trim().toLocaleLowerCase() : false;
        urlImage = typeof urlImage === 'string' && urlImage.trim() ?
        urlImage.trim().toLocaleLowerCase() : false;
        // Get the current item data object
        const product = await _data.read('products', id);
        if (product) {
          // verify that at least one parameter is valid
          if (name || cost || description || currency || urlImage) {
            // Count the affected fields
            let counter = 0;
            if (name && name !== product.name) {
              product.name = name;
              counter++;
            }
            if (cost && cost !== product.cost) {
              product.cost = cost;
              counter++;
            }
            if (currency && currency !== product.currency) {
              product.currency = currency;
              counter++;
            }
            if (description && description !== product.description) {
              product.description = description;
              counter++;
            }
            if (urlImage && urlImage !== product.urlImage) {
              product.urlImage = urlImage;
              counter++;
            }
            // Store the new product data
            const op = await _data.update('products', product.id, product);
            res.status(200).send({ operationSuccess: op, affectedFields: counter, item: product });
          } else {
            res.status(400).send({Error: 'There are not fields to update'});
          }     
        } else {
          res.status(400).send({Error: 'Could not find the specified product'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
  // Delete a specified item by the id
  App.delete(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the id
        let { id } = req.queryString;
        // Verify if id is a valid field
        id = typeof id === 'string' && id.trim() ?
        id.trim() : false;
        if (id) {
          // delete the user
          const op = await _data.delete('products', id);
          res.status(200).send({ operationSuccess: op });
        } else {
          res.status(400).send({Error: 'Missing required fields, please provide the id'});
        }
      } else {
        res.status(401).send({Error: 'Not authorized. The token in the headers is missing or it is not valid' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong' });
    }
  });
};
