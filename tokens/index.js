/**
 * Library to manipulate tokens
 */
// Dependencies
const _data = require('../lib/data');
const helpers = require('../helpers');

// Export the module that contains all the operations to manipulate the tokens
module.exports = {
  async createToken({ username, email}) {
    try {
      // Validate all parameters
      username = typeof username === 'string' && username.trim() ?
      username.trim() : false;
      email = typeof email === 'string' && username.trim() ?
      email.trim() : false;
      if (username && email) {
        // Create a token
        const tokenDetails = {
          id: helpers.createRandomString(25),
          user: username,
          expires: Date.now() + 1000 * 60 * 60,
        }
        // Store the token
        await _data.create('tokens', tokenDetails.id, tokenDetails);
        return tokenDetails;
      }
    } catch (error) {
      return false;
    }
  },
  async updateTokenExpiration(tokenId) {
    try {
      if (tokenId) {
        const oldToken = await _data.read('tokens', tokenId);
        if (oldToken) {
          oldToken.expires = Date.now() + 1000 * 60 * 60;
          const op = await _data.update('tokens', tokenId, oldToken);
          return op;
        } else {
          return false;
        }
      } else {
        return false;
      }
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
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  async deleteToken(tokenId) {
    try {
      if (tokenId) {
        const token = await this.getToken(tokenId);
        if (token) {
          const op = await _data.delete('tokens', tokenId);
          return op;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  async getToken(tokenId) {
    try {
      if (tokenId) {
        const token = await _data.read('tokens', tokenId);
        if (token) {
          return token;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
  async getAllTokens() {
    try {
      const tokens = await _data.list('tokens', false);
      if (tokens) {
        return tokens;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  },
};
