/**
 * Server configuration file
 */

// Dependencies
const http = require('http');
const https = require('https');
const Url = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const util = require('util');
const { join } = require('path');
const config = require('../config');
const helpers = require('../helpers');

const debug = util.debuglog('server');

// Server state
let enableHttp = false;
let enableHttps = false;

// Define the http methods that the server allows
const availableMethods = ['get', 'post', 'put', 'delete'];
// Instantiate the server object
const server = {};
// static content paths
server.staticPaths = [];

// Container for the server routes
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
 * Recursive function
 * This function returns the path of each file within a root directory
 * @param {*} rootDir root directory
 * @param {*} files variable to get the previous files in the recursive function
 */
const getPaths = async (rootDir, files, originDir) => {
  try {
    files = typeof files === 'object' ? files : [];
    originDir = typeof originDir !== 'undefined' ? originDir : rootDir;
    const dirContent = fs.readdirSync(rootDir);
    for (let i = 0; i < dirContent.length; i++) {
      const isAfolder = fs.lstatSync(`${rootDir}/${dirContent[i]}`).isDirectory();
      if (isAfolder) {
        const subDirContent = getPaths(`${rootDir}/${dirContent[i]}`, files, originDir);
        if (subDirContent.length) {
          files.concat(subDirContent);
        }
      } else {
        const shortPath = originDir !== rootDir ? `${rootDir
          .substring(originDir.length, rootDir.length)
          .replace(/\\/g, '/')}/${dirContent[i]}` : `/${dirContent[i].toLocaleLowerCase()}`;
        files.push({
          origin: `${rootDir}/${dirContent[i]}`.toLocaleLowerCase(),
          shortPath,
          fileName: dirContent[i].toLocaleLowerCase(),
        });
      }
    }
    return files;
  } catch (error) {
    console.log(error);
    throw new Error('Something went wrong', error);
  }
};
/**
 * file reader helper
 */
const fileReader = async (args) => {
  try {
    let output;
    if (typeof args === 'object') {
      const fileData = fs.readFileSync(args.origin);
      const mimeType = helpers.getMimeType(args.fileName);
      output = {
        file: fileData,
        mimeType,
      };
    } else if (typeof args === 'string') {
      output = fs.readFileSync(args);
    }
    return output;
  } catch (err) {
    throw new Error('Something went wrong', err);
  }
};
/**
 * Static content handler
 */
const staticContentHandler = (req, res) => {
  try {
    // get the file path
    const { fileOptions } = req;
    if (fileOptions) {
      res.sendFile(fileOptions.origin);
    } else {
      res.status(404).send({});
    }
  } catch (error) {
    console.log(error);
    debug(error);
  }
};

/**
 * This function is used to configure a directory of static files
 * @param {String} rootDir is the path that contains the static files
 * @param {String} endPoint is the base route on the server that returns the static files
 */
server.static = (rootDir, endPoint) => {
  // Validate the parameters
  rootDir = typeof rootDir === 'string' && rootDir.length > 0
    ? rootDir : false;
  endPoint = typeof endPoint === 'string' && endPoint.length > 0
    ? endPoint : false;
  // check if the parameters are valid
  if (rootDir && endPoint) {
    // check if the "endpoint" contains a slash at the end, if it contains it, it will be removed
    endPoint = endPoint[endPoint.length - 1] === '/' ? endPoint.substring(0, endPoint.lastIndexOf('/')) : endPoint;
    // get the path of each file
    getPaths(`${rootDir}`).then((paths) => {
      const serverPaths = [];
      for (let i = 0; i < paths.length; i++) {
        serverPaths.push({
          ...paths[i],
          endpoint: `${endPoint}${paths[i].shortPath}`,
        });
      }
      // save the static paths
      server.staticPaths.push(...serverPaths);
    });
  } else {
    throw new Error('Missing required data in parameters');
  }
};

/**
 * This function allows to get an specific route of the router
 * @param {String} path path of the request that the client is looking for
 * @param {String} method method of the request that the client is looking for
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
 * this function allows to add a GET, POST, PUT, and DELETE request to the router
 * @param {String} path route for the "get" request
 * @param {Function} cb callback
 * @param {String} method http/https request method
 */
const addRoute = (path, cb, method) => {
  // Validate the paramaters
  path = typeof path === 'string' && path.length > 0
    ? path.trim().toLowerCase() : false;
  cb = typeof cb === 'function' ? cb : false;
  method = typeof method === 'string'
    && availableMethods.indexOf(method.trim().toLowerCase()) > -1
    ? method.trim().toLowerCase() : false;
  if (path && cb && method) {
    // Check if the route does not exist in the [METHOD] request object
    if (!router[method][path]) {
      router[method][path] = cb;
    } else {
      throw new Error('The route could not be added twice');
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
  res.sendFile = async (args) => {
    const data = await fileReader(args);
    if (typeof args === 'object') {
      res.setHeader('Content-Type', data.mimeType);
    } else {
      const mime = helpers.getMimeType(args);
      res.setHeader('Content-Type', mime);
    }
    res.end(data);
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
    let contentType = headers['content-type'] ? headers['content-type'].trim().toLowerCase() : 'application/json';
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
    // get the virtual path from the router, if it exist
    const routeHandler = getRoute(trimmedPath, method);
    // get static virtual path, if it exists
    let staticRoute = server.staticPaths.filter(x => x.endpoint === url)[0];
    // If the path is "/", look for the file "index" inside the directory of static files
    if (!routeHandler && !staticRoute && url === '/') {
      staticRoute = server.staticPaths.filter(x => x.endpoint === '/index.html')[0];
    }
    const data = {
      trimmedPath,
      queryString,
      url,
      method,
      headers,
      body,
    };
    // Check if the request is looking for static content
    if (!routeHandler && staticRoute && method === 'GET') {
      // add the static file info to the data object
      data.fileOptions = staticRoute;
      return staticContentHandler(data, res);
    }
    // Default config for the headers
    res.setHeader('Content-Type', 'application/json');
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
 * @param {*} httpIsEnabled allows the HTTP protocol
 * @param {*} httpsIsEnabled allows the HTTPS protocol
 */
module.exports = (httpIsEnabled = true, httpsIsEnabled) => {
  if (typeof httpIsEnabled === 'boolean' || typeof httpsIsEnabled === 'boolean') {
    enableHttp = httpIsEnabled;
    enableHttps = httpsIsEnabled;
    // Check if at least one parameter is true
    if (!enableHttp && !enableHttps) {
      enableHttp = true;
    }
    return server;
  }
  throw new Error('One of the parameters are invalid, it was expected a boolean');
};
