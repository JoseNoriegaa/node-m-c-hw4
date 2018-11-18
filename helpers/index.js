/**
 * Filer for helpers
 */
// Dependencies
const QueryString = require('querystring');
const crypto = require('crypto');
const Config = require('../config');
const Https = require('https');
const { StringDecoder } = require('string_decoder');

const hashingSecret = process.env.SECRET_WORD_APP || 'secret token here';

// Container for the module
const helpers = {};

/**
 * This function allows to send a email 
 * @param {String} email 
 * @param {String} subject 
 * @param {String} message 
 * @param {Function} cb 
 */
helpers.mailgun = (email, subject, message, cb) => {
  // Validate all parameters
  email = typeof email === 'string' && helpers.isAnEmail(email.trim()) ?
  email.trim() : false;
  subject = typeof subject === 'string' && subject.trim().length > 0 ?
  subject.trim() : false;
  message = typeof message === 'string' && message.trim().length > 0 ?
  message.trim() : false;
  if (email && subject && message) {
    // Payload details
    const payload = {
      from: Config.mailgun.sender,
      to: email,
      subject,
      text: message,
    };

    const payloadStr = QueryString.stringify(payload);
    // Request details
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.mailgun.net',
      method: 'POST',
      path: `/v3/${Config.mailgun.domain}/messages`,
      auth: `api:${Config.mailgun.apiKey}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payloadStr)
      },
    };
    // Request
    const req = Https.request(requestDetails, (res) => {
      // Get the status code
      const { statusCode } = res;
      // Check if response returns an error code
      if (statusCode === 200 || statusCode === 201) {
        cb(false, 'The email has been sent', statusCode);
      } else {
        cb(true, 'Could not send the email', statusCode);
      }
    });
    // Get errors
    req.on('error',function(e){
      console.log(e);
      cb(e, 'Could not send the email');
    });
    // Add the payload
    req.write(payloadStr);
    // End the request
    req.end();
  } else {
    callback(true, 'Missing required fields', 400);
  }
};

/**
 * Charge, Stripe API
 * @param {Number} amount 
 * @param {String} currency 
 * @param {String} description 
 * @param {String} source 
 * @param {Function} cb 
 */
helpers.stripeChange = (amount, currency, description, source, cb) => {
	// Validate all parameters
	var amount = typeof amount === 'number' && amount > 0 ? amount : false;
	var currency = typeof currency === 'string' && currency.trim().length === 3 ? currency.trim().toLowerCase() : false;
	var description = typeof description === 'string' && description.trim().length > 0 ? description.trim() : false;
	var source = typeof source === 'string' && source.trim().length > 0 ? source.trim() : false;
	if(amount && currency && description && source){
    // Fix decimals
    amount = amount * 100;
		// Request payload
    const payload = {
      amount,
      currency,
      description,
      source,
    };
    
    // Payload OBJ to string (urlencoded)
    const payloadStr = QueryString.stringify(payload);
    // Request details
    const requestDetails = {
      protocol: 'https:',
      hostname: Config.stripe.hostname,
      method: 'POST',
      auth: Config.stripe.secretKey,
      path: '/v1/charges',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(payloadStr)
      },
    };
    // Request
    const req = Https.request(requestDetails, (res) => {
      // Get the request data
      const decoder = new StringDecoder('utf-8');
      let buffer = '';
      res.on('data', function(data) {
        buffer += decoder.write(data);
      });
      res.on('end', function() {
        buffer += decoder.end();
        if (res.statusCode == 200 ) {
          const parsedData = helpers.parseJsonToObject(buffer);
          // Send the payment details
          cb(false, parsedData);
        } else {
          console.log(res.statusCode);
          cb('the payment could not be processed');
        }
      });
    });
    // Get errors
    req.on('error', (e) => {
      console.log('request errors', e);
    });
    // Add the payload 
    req.write(payloadStr);
    // End the request
    req.end();
	} else {
		cb('Missing required fields');
	}
}

/**
 * This function convert the provided data to a Json Object if is possible,
 * if it not is possible it returns the original data
 * @param {*} str payload to parse
 */
helpers.parseJsonToObject = (str) => {
  try {
    if (str) {
      const obj = JSON.parse(str);
      return obj;
    }
    return str;
  } catch (error) {
    return str;
  }
};
/**
 * This function convert the provided data to a Json Object if is possible,
 * if it not is possible it returns the original data
 * @param {*} str payload to parse
 */
helpers.parseUrlencodedToObject = (str) => {
  if (str) {
    const obj = QueryString.parse(str);
    return obj;
  }
  return str;
};
/**
 * This function returns a random string with a length defined by the parameter "stringLenght
 * @param {Number} stringLenght Number that limit the length of the random string
 * @returns {String} Random string
 */
helpers.createRandomString = (stringLenght) => {
  stringLenght = typeof stringLenght === 'number' && stringLenght > 0 ?
  stringLenght : false;
  if (stringLenght) {
    // Define all the posible caracteres that could go into the string
    const possibleCharacteres = 'abcdefghijkmnlopqrstuvwxyz0123456789';
    // Start the final string
    let str = '';
    for (let i = 0; i < stringLenght; i++) {
      // Get random character from the possibleCharacteres string
      const randomChar = possibleCharacteres.charAt(Math.floor(Math.random() * possibleCharacteres.length));
      // Append this character to the final string
      str += randomChar;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};
/**
 * this function creates an encrypted string from the provided string
 * @param {String} str String to be encrypted
 * @returns {String | Boolean} returns a hashed string if it is valid, if not is valid it returns false
 */
helpers.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};
/**
 * This function validate if a string provided is a valid email
 * @param {String} email String that contains the Email to validate 
 * @returns {Boolean}
 */
helpers.isAnEmail = (email) => {
  if (typeof email === 'string' && email) {
    const reg = /[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,3}/;
    return reg.test(email);
  }
  return false;
};
module.exports = helpers;
