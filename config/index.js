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
    publicKey: process.env.STRIPE_PK,
    secretKey: process.env.STRIPE_SK,
  },
  mailgun: {
    domain: process.env.MAILGUN_DOMAIN,
    apiKey: process.env.MAILGUN_API_KEY,
    sender: process.env.MAINGUN_SENDER,
  },
};
// Prod env config
env.prod = {
  httpPort: 3001,
  httpsPort: 5001,
  envName: 'dev',
  stripe: {
    hostname: 'api.stripe.com',
    publicKey: process.env.STRIPE_PK,
    secretKey: process.env.STRIPE_SK,
  },
  mailgun: {
    domain: process.env.MAILGUN_DOMAIN,
    apiKey: process.env.MAILGUN_API_KEY,
    sender: process.env.MAINGUN_SENDER,
  },
};
// Get the current env
const currentEnv = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production'
  ? 'prod' : 'dev';
// Export the module
module.exports = env[currentEnv];
