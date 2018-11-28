class AppConfig {
  constructor() {
    this.state = {
      auth: {},
      products: [],
      order: {},
    };
    this.load();
  }
  load() {
    try {
      const authSession = window.sessionStorage.getItem('auth');
      if (authSession) {
        Object.assign(this.state, { auth: JSON.parse(authSession) });
      }
    } catch (error) {
      console.log({error});
    }
  }
  async login(username, password) {
    try {
      if (username && password && !this.state.auth.id) {
        const url = '/api/auth/login';
        const method = 'POST';
        const headers = {
          'content-type': 'application/json',
        };
        const body = JSON.stringify({ username, password });
        const config = {
          method,
          headers,
          body,
        };
        // Request
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          const { token } = data;
          if (token) {
            // store the token
            window.sessionStorage.setItem('auth', JSON.stringify(token));
            return Object.assign(this.state, { auth: token });
          } else {
            return false
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('login', error);
      return false;
    }
  }
  async logout() {
    try {
      const { id } = this.state.auth;
      console.log('entro', this.state);
      if (id) {
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const url = '/api/auth/logout';
        const config = {
          method: 'POST',
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          const { operationSuccess } = data;
          if (operationSuccess) {
            window.sessionStorage.removeItem('auth');
            this.state.auth = {};
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('logout', {error});
      return false;
    }
  }
  async getProducts() {
    try {
      // token id
      const { id } = this.state.auth;
      if (id) {
        const url = '/api/products';
        const method = 'GET';
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          method,
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          this.state.products = data;
        } else {
          return false
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('getProducts', {error});
      return false;
    }
  }
  async getProduct(productId) {
    try {
      productId = typeof productId === 'string' && productId.trim() ? productId : false;
      // token id
      const { id } = this.state.auth;
      if (id && productId) {
        const url = `/api/product?id=${productId}`;
        const method = 'GET';
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          method,
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('getProducts', {error});
      return false;
    }
  }
  async orderAddItem(productId, quantity ) {
    try {
      productId = typeof productId === 'string' && productId.trim() ? productId.trim(): false;
      quantity = typeof quantity === 'number' && quantity > 0 ? quantity : false;
      const { user, id } = this.state.auth;
      if (user && id && productId && quantity) {
        const method = 'POST';
        const url = '/api/order/item';
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const body = {
          username: user,
          productId,
          quantity,
        };
        const config = {
          headers,
          body: JSON.stringify(body),
          method,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          if (data && !data.Error) {
            return Object.assign(this.state, { order: data });
          } else {
            return false;
          }
        } else {
          return false;          
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('addProduct', {error});
    }
  }
  async getOrder() {
    try {
      const { user, id } = this.state.auth;
      if (user && id) {
        const method = 'GET';
        const url = `/api/order?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          headers,
          method,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          if (data && !data.Error) {
            return data;            
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      } 
    } catch (error) {
      console.error('getOrder', {error});
      return false;
    }
  }
  async orderDeleteItem(productId) {
    try {
      productId = typeof productId === 'string' && productId.trim() ? productId : false;
      // token id
      const { user, id } = this.state.auth;
      if (id && user && productId) {
        const url = '/api/order/item';
        const method = 'DELETE';
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const body = {
          username: user,
          productId,
        }
        const config = {
          method,
          headers,
          body: JSON.stringify(body),
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('orderDeleteItem', { error });
      return false;
    }
  }
  async orderDelete() {
    try {
      const { user, id } = this.state.auth;
      if (user && id) {
        const method = 'DELETE';
        const url = `/api/order?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          headers,
          method,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          if (data && !data.Error) {
            return data;            
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      } 
    } catch (error) {
      console.error('orderDelete', {error});
      return false;
    }
  }
  async getUserInfo() {
    try {
      const { id, user } = this.state.auth;
      if (id && user) {
        const method = 'GET';
        const url = `/api/user?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          method,
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('getUserInfo', {error});
      return false;
    }
  }
  async updateUserInfo(email, fullname, password, address) {
    try {
      const { id, user } = this.state.auth;
      if (id && user) {
        const method = 'PUT';
        const url = `/api/user?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const body = {
          email,
          fullname,
          password,
          address
        };
        const config = {
          method,
          headers,
          body,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('getUserInfo', {error});
      return false;
    }
  }
  async deleteUser() {
    try {
      const { id, user } = this.state.auth;
      if (id && user) {
        const method = 'DELETE';
        const url = `/api/user?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
        };
        const config = {
          method,
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          const { Error } = data;
          if (!Error) {
            await this.logout();
          }
          return data;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('getUserInfo', {error});
      return false;
    }
  }
}
let app = {};
window.onload = () => {
  app = new AppConfig();
  // console.log(app.state);
};