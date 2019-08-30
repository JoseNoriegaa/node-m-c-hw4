/**
 * Web App http handlers
 */
// Dependencies
const helpers = require('../helpers');

/**
 * Returns the routes related to the WebApp
 * @param {Object} App Server instance
 */
module.exports = (App) => {
  App.get('/', (req, res) => {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'The best pizza delivery app',
      'head.description': 'Place your order with a couple steps',
    };
    helpers.getTemplate('home', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            res.setHeader('content-type', 'text/html');
            res.status(200).end(str);
          } else {
            res.status(404).send({ Error: err});
          }
        });
      } else {
        res.status(404).send({ Error: 'Something went wrong.' });
      }
    });
  });
  App.get('/login', (req, res) => {
    // Prepare data for interpolation
    const templateData = {
     'head.title': 'Login',
    };
    helpers.getTemplate('login', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            res.setHeader('content-type', 'text/html');
            res.status(200).end(str);
          } else {
            res.status(404).send({ Error: err});
          }
        });
      } else {
        res.status(404).send({ Error: 'Something went wrong.' });
      }
    });
  });
  App.get('/signup', (req, res) => {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Sign Up',
      'head.description': 'Sign Up for free',
    };
    helpers.getTemplate('signUp', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            res.setHeader('content-type', 'text/html');
            res.status(200).end(str);
          } else {
            res.status(404).send({ Error: err});
          }
        });
      } else {
        res.status(404).send({ Error: 'Something went wrong.' });
      }
    });
  });
  App.get('/profile', (req, res) => {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Profile',
    };
    helpers.getTemplate('profile', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            res.setHeader('content-type', 'text/html');
            res.status(200).end(str);
          } else {
            res.status(404).send({ Error: err});
          }
        });
      } else {
        res.status(404).send({ Error: 'Something went wrong.' });
      }
    });
  });
  App.get('/order', (req, res) => {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Order',
    };
    helpers.getTemplate('order', templateData, (err, str) => {
      if (!err && str) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if (!err && str) {
            res.setHeader('content-type', 'text/html');
            res.status(200).end(str);
          } else {
            res.status(404).send({ Error: err});
          }
        });
      } else {
        res.status(404).send({ Error: 'Something went wrong.' });
      }
    });
  });
};
