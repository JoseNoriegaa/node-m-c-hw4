/**
 * Product properties
 * id
 * name
 * description
 * price
 * currency
 * urlImage
 */
// Dependecies
const util = require('util');
const data = require('../lib/data');
const helpers = require('../helpers');
const Tokens = require('../tokens');

const debug = util.debuglog('products');
const main = '/api/product';

/**
 * Returns the functions related to the products
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  // Get the items
  App.get(`${main}s`, async (req, res) => {
    try {
      // validate the token in the headers
      // const { token } = req.headers;
      // const validToken = await Tokens.validateToken(token);
      // if (validToken) {
      const products = await data.list('products', false);
      if (products) {
        res.status(200).send(products);
      } else {
        res.status(200).send([]);
      }
      // } else {
      //   res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      // }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Get a specific item
  App.get(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      // const { token } = req.headers;
      // const validToken = await Tokens.validateToken(token);
      // if (validToken) {
      // Get the id
      let { id } = req.queryString;
      id = typeof id === 'string' && id.trim()
        ? id.trim() : false;
      if (id) {
        const product = await data.read('products', id);
        if (product) {
          const response = product;
          res.status(200).send(response);
        } else {
          res.status(404).send({ Error: 'Could not find the any product.' });
        }
      } else {
        res.status(400).send({ Error: 'Missing required fields.' });
      }
      // } else {
      //   res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      // }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
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
        let {
          name,
          price,
          description,
          currency,
          urlImage,
        } = req.body;
        // Validate the parameters
        name = typeof name === 'string' && name.trim()
          ? name.trim().toLocaleLowerCase() : false;
        price = typeof price === 'string' && /^[0-9]+.?[0-9]+$/.test(price.trim())
          ? price.trim().toLocaleLowerCase() : false;
        currency = typeof currency === 'string' && ['usd', 'mxn'].indexOf(currency.trim().toLocaleLowerCase()) > -1
          ? currency.trim().toLocaleLowerCase() : false;
        description = typeof description === 'string' && description.trim()
          ? description.trim().toLocaleLowerCase() : false;
        urlImage = typeof urlImage === 'string' && urlImage.trim()
          ? urlImage.trim().toLocaleLowerCase() : false;
        if (name && price && description && currency && urlImage) {
          const id = helpers.createRandomString(20);
          const product = {
            id,
            name,
            price,
            description,
            currency,
            urlImage,
          };
          // create a new product
          const op = await data.create('products', product.id, product);
          res.status(201).send({ operationSuccess: op, item: product });
        } else if (!name) {
          res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid name.' });
        } else if (!price) {
          res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid price.' });
        } else if (!description) {
          res.status(400).send({ Error: 'There are missing or invalid fields. Please provide the description.' });
        } else if (!currency) {
          res.status(400).send({ Error: 'There are missing or invalid fields. Please provide a valid currency.' });
        } else {
          res.status(400).send({ Error: 'There are missing or invalid fields.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Update a specific item
  App.put(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the item data
        const { id } = req.queryString;
        let {
          name,
          price,
          description,
          currency,
          urlImage,
        } = req.body;
        // Validate the parameters
        name = typeof name === 'string' && name.trim()
          ? name.trim().toLocaleLowerCase() : false;
        price = typeof price === 'string' && /^[0-9]+.?[0-9]+$/.test(price.trim())
          ? price.trim().toLocaleLowerCase() : false;
        currency = typeof currency === 'string' && ['usd', 'mxn'].indexOf(currency.trim().toLocaleLowerCase()) > -1
          ? currency.trim().toLocaleLowerCase() : false;
        description = typeof description === 'string' && description.trim()
          ? description.trim().toLocaleLowerCase() : false;
        urlImage = typeof urlImage === 'string' && urlImage.trim()
          ? urlImage.trim().toLocaleLowerCase() : false;
        // Get the data-object of the current item
        const product = await data.read('products', id);
        if (product) {
          // Check if at least one parameter is valid
          if (name || price || description || currency || urlImage) {
            // Count the affected fields
            let counter = 0;
            if (name && name !== product.name) {
              product.name = name;
              counter++;
            }
            if (price && price !== product.price) {
              product.price = price;
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
            const op = await data.update('products', product.id, product);
            res.status(200).send({ operationSuccess: op, affectedFields: counter, item: product });
          } else {
            res.status(400).send({ Error: 'There are not fields to update.' });
          }
        } else {
          res.status(400).send({ Error: 'Could not find the specific product.' });
        }
      } else {
        res.status(401).send({ Error: 'Not authorized. The token in the headers is missing or it is not valid.' });
      }
    } catch (e) {
      debug(e);
      res.status(500).send({ Error: 'Something went wrong.' });
    }
  });
  // Delete a specific item
  App.delete(`${main}`, async (req, res) => {
    try {
      // validate the token in the headers
      const { token } = req.headers;
      const validToken = await Tokens.validateToken(token);
      if (validToken) {
        // Get the id
        let { id } = req.queryString;
        // check if the id is a valid field
        id = typeof id === 'string' && id.trim() ? id.trim() : false;
        if (id) {
          // delete the user
          const op = await data.delete('products', id);
          res.status(200).send({ operationSuccess: op });
        } else {
          res.status(400).send({ Error: 'Missing required fields. Please provide the id.' });
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
