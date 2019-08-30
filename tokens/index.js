/**
 * Library to manipulate tokens
 */
// Dependencies
const data = require('../lib/data');
const helpers = require('../helpers');

// Export the module that contains all the operations to manipulate the tokens
module.exports = {
  async createToken({ username, email }) {
    try {
      // Validate the parameters
      username = typeof username === 'string' && username.trim()
        ? username.trim() : false;
      email = typeof email === 'string' && username.trim()
        ? email.trim() : false;
      if (username && email) {
        // Create a new token
        const tokenDetails = {
          id: helpers.createRandomString(25),
          user: username,
          email,
          expires: Date.now() + 1000 * 60 * 60,
        };
        // Store the token
        await data.create('tokens', tokenDetails.id, tokenDetails);
        return tokenDetails;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async updateTokenExpiration(tokenId) {
    try {
      if (tokenId) {
        const oldToken = await data.read('tokens', tokenId);
        if (oldToken) {
          oldToken.expires = Date.now() + 1000 * 60 * 60;
          const op = await data.update('tokens', tokenId, oldToken);
          return op;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async validateToken(tokenId) {
    try {
      if (tokenId) {
        const token = await this.getToken(tokenId);
        if (token && token.expires > Date.now()) {
          return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async deleteToken(tokenId) {
    try {
      if (tokenId) {
        const token = await this.getToken(tokenId);
        if (token) {
          const op = await data.delete('tokens', tokenId);
          return op;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async getToken(tokenId) {
    try {
      if (tokenId) {
        const token = await data.read('tokens', tokenId);
        if (token) {
          return token;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  },
  async getAllTokens() {
    try {
      const tokens = await data.list('tokens', false);
      if (tokens) {
        return tokens;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
};
