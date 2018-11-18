/**
 * Configuration environment file
 */

// Container for all configurations
const env = {};
// Dev env config
env.dev = {
  httpPort: 3000,
  httpsPort: 5000,
  envName: 'dev',
  stripe: {
    hostname: 'api.stripe.com',
    publicKey: 'public key',
    secretKey: 'secret key',
  },
  mailgun: {
    domain: 'domain.mailgun.org',
    apiKey: 'api key',
    sender: 'Pizza App <email@email.com>',
  }
};
// Prod env config
env.prod = {
  httpPort: 3001,
  httpsPort: 5001,
  envName: 'dev',
  stripe: {
    hostname: 'api.stripe.com',
    publicKey: 'public key',
    secretKey: 'secret key',
  },
  mailgun: {
    domain: 'domain.mailgun.org',
    apiKey: 'api key',
    sender: 'Pizza App <email@email.com>',
  }
};
// Get the current env
const currentEnv = typeof process.env.NODE_ENV === 'string' ?  process.env.NODE_ENV.trim().toLowerCase() === 'prod' || process.env.NODE_ENV.trim().toLowerCase() === 'production' ?
'prod' : 'dev' : 'dev';

// Export the module
module.exports = env[currentEnv];
