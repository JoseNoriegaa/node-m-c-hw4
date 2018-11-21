/**
 * Server configuration file
 */

// Dependencies
const http = require('http');
const https = require('https');
const Url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const { join } = require('path');
const config = require('../config');
const helpers = require('../helpers');

// Server state
let enableHttp = false;
let enableHttps = false;

// Define the http methods that the server allow
const availableMethods = ['get', 'post', 'put', 'delete'];
// Instantiate the server module object
const server = {};

// Container for all routes in the server
const router = {};
// GET resquests container
router.get = {};
// POST requests container
router.post = {};
// PUT requests container
router.put = {};
// DELETE requets container
router.delete = {};

/**
 * This function allows to get an specified route of the router
 * @param {String} path path of the request that the requester is looking for
 * @param {String} method method of the request that the requester is looking for
 */
const getRoute = (path, method) => {
  // validate parameters
  path = typeof path === 'string' && path.trim().length > -1
    ? path.trim().toLowerCase() : false;
  path = path[0] === '/' ? path : `/${path}`;
  method = typeof method === 'string' && availableMethods.indexOf(method.trim().toLocaleLowerCase()) > -1
    ? method.trim().toLowerCase() : false;
  if (path && method) return router[method][path];
  return false;
};


/**
 * this function allows to add a GET, POST, PUT, and DELETE request to the server router
 * @param {String} path route path for the get request
 * @param {Function} cb callback
 * @param {String} method http or https request method
 */
const addRoute = (path, cb, method) => {
  // Validate all paramaters
  path = typeof path === 'string' && path.length > 0
    ? path.trim().toLowerCase() : false;
  cb = typeof cb === 'function' ? cb : false;
  method = typeof method === 'string'
    && availableMethods.indexOf(method.trim().toLowerCase()) > -1
    ? method.trim().toLowerCase() : false;
  if (path && cb && method) {
    // Check if the route does not already exist in the [METHOD] request object
    if (!router[method][path]) {
      router[method][path] = cb;
    } else {
      throw new Error('The route could not be added because the route path already exist');
    }
  } else {
    throw new Error('The route could not be added because one of the parameters provided is not valid');
  }
};
// Add a GET request
server.get = (path, cb) => {
  addRoute(path, cb, 'get');
};
// Add a POST request
server.post = (path, cb) => {
  addRoute(path, cb, 'post');
};
// Add a PUT request
server.put = (path, cb) => {
  addRoute(path, cb, 'put');
};
// Add a DELETE request
server.delete = (path, cb) => {
  addRoute(path, cb, 'delete');
};

// router handler
const routesHandler = (req, res) => {
  const { url, method, headers } = req;
  // Get the url and parse it
  const parseURL = Url.parse(url, true);
  // Get the path
  const path = parseURL.pathname;
  let trimmedPath = path.replace(/^\/+|\/+$/g, '');
  trimmedPath = trimmedPath === '' ? '/' : trimmedPath;
  // Get the query string as an object
  const queryString = parseURL.query;
  // response helpers
  res.send = (payload) => {
    // Convert the payload to string
    payload = JSON.stringify(payload);
    res.end(payload);
  };
  res.status = (statusCode) => {
    res.writeHead(statusCode);
    return res;
  };
  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    let body = buffer;
    // Support for 'Content-Type' JSON, Urlencoded, multipart/form-data is not supported
    let contentType = headers['content-type'].trim().toLowerCase();
    contentType = new RegExp('multipart/form-data', 'g').test(contentType) ? 'multipart/form-data' : contentType;
    switch (contentType) {
      case 'application/json':
        body = helpers.parseJsonToObject(buffer);
        break;
      case 'application/x-www-form-urlencoded':
        body = helpers.parseUrlencodedToObject(buffer);
        break;
      case 'multipart/form-data':
        return res.status(400).send({ Error: 'multipart/form-data is not supported.' });
        break;
      default:
        body = helpers.parseJsonToObject(buffer);
        break;
    }
    const data = {
      trimmedPath,
      queryString,
      method,
      headers,
      body,
    };
    // Default config for headers
    res.setHeader('Content-Type', 'application/json');
    const routeHandler = getRoute(trimmedPath, method);
    if (routeHandler) {
      return routeHandler(data, res);
    }
    return res.status(404).send({ Error: `${method} /${trimmedPath} not found` });
  });
};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => routesHandler(req, res));
// Instantiate the HTTPS server
const httpsOptions = {
  key: fs.readFileSync(join(__dirname, '../SSL/server.key')),
  cert: fs.readFileSync(join(__dirname, '../SSL/server.cert')),
};
server.httpsServer = https.createServer(httpsOptions, (req, res) => routesHandler(req, res));

// Init scripts
server.init = () => {
  // Start the HTTP server if it is enabled
  if (enableHttp) {
    server.httpServer.listen(config.httpPort, () => {
      console.log('\x1b[36m%s\x1b[0m', `HTTP server listening on port ${config.httpPort} in ${config.envName} mode.`);
    });
  }
  // Start the HTTPS server if it is enabled
  if (enableHttps) {
    server.httpsServer.listen(config.httpsPort, () => {
      console.log('\x1b[35m%s\x1b[0m', `HTTPS server listening on port ${config.httpsPort} in ${config.envName} mode.`);
    });
  }
};

/**
 * Export the server
 * @param {*} httpIsEnabled allow the HTTP protocol
 * @param {*} httpsIsEnabled allow the HTTPS protocol
 */
module.exports = (httpIsEnabled = true, httpsIsEnabled) => {
  if (typeof httpIsEnabled === 'boolean' || typeof httpsIsEnabled === 'boolean') {
    enableHttp = httpIsEnabled;
    enableHttps = httpsIsEnabled;
    // verify that at least one parameter is true
    if (!enableHttp && !enableHttps) {
      enableHttp = true;
    }
    return server;
  }
  throw new Error('One of the parameters are invalid, it was expected a boolean');
};
