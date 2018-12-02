class AppConfig {
  constructor() {
    this.state = {
      auth: {},
      products: [],
      order: {user: null, items: []},
    };
    this.load();
  }
  async load() {
    try {
      const authSession = window.sessionStorage.getItem('auth');
      if (authSession) {
        Object.assign(this.state, { auth: JSON.parse(authSession) });
        await this.getOrder();
      }
    } catch (error) {
      console.error({error});
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
            this.setLoggedInClass(true);
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
            this.setLoggedInClass(false);
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
        const url = '/api/products';
        const method = 'GET';
        const headers = {
          'content-type': 'application/json',
        };
        const config = {
          method,
          headers,
        };
        const response = await fetch(url, config);
        if (response) {
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
          const data = await response.json();
          // this.state.products = data;
          return Object.assign(this.state, { products: data });
        } 
        return false

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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
          const data = await response.json();
          if (data && !data.Error) {
            this._setBadge(data.items.length);
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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
          const data = await response.json();
          if (data && !data.Error) {
            this._setBadge(data.items.length);
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
        };
        const config = {
          method,
          headers,
          body: JSON.stringify(body),
        };
        const response = await fetch(url, config);
        if (response) {
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
          const data = response.status === 204 ? true : await response.json();
          if (data) {
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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
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
          body: JSON.stringify(body),
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          return response.status === 200 ? data : false;
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
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
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
  async createUser(username, email, fullname, password, address) {
    try {
      username = typeof username === 'string' && username.trim() ? username.trim() : false;
      email = typeof email === 'string' && email.trim() ? email.trim() : false;
      fullname = typeof fullname === 'string' && fullname.trim() ? fullname.trim() : false;
      password = typeof password === 'string' && password.trim() ? password.trim() : false;
      address = typeof address === 'string' && address.trim() ? address.trim() : false;
      if (username && email && fullname && password && address) {
        const method = 'POST';
        const url = '/api/user';
        const headers = {
          'content-type': 'application/json',
        };
        const body = {
          username,
          email,
          fullname,
          password,
          address,
        };
        const config = {
          method,
          headers,
          body: JSON.stringify(body),
        };
        const response = await fetch(url, config);
        if (response) {
          const data = await response.json();
          if (data && !data.Error) {
            return data;
          } else {
            console.error('createUser error', {data});
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('createUser', {error});
      return false;
    }
  }
  async pay(stripeToken) {
    try {
      stripeToken = typeof stripeToken === 'string' && stripeToken.trim() ? stripeToken.trim() : false;
      const { user, id } = this.state.auth;
      const { order } = this.state;
      if (user && id && order.items.length > 0 && stripeToken) {
        const method = 'POST';
        const url = `/api/order/pay?username=${user}`;
        const headers = {
          'content-type': 'application/json',
          'token': id,
          'stripeSource': stripeToken,
        };
        console.log({headers});
        
        const config = {
          headers,
          method,
        };
        const response = await fetch(url, config);
        if (response) {
          if (response.status === 401) {
            const logout = await this.logout();
            if (logout) {
              window.location = '/login';
            } else {
              window.sessionStorage.removeItem('auth');
            }
            return false;
          }
          const data = await response.json();
          if (data && !data.Error) {
            this._setBadge(0);
            return Object.assign(this.state.order, { user: null, items: [] });            
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
      console.error('pay', error);
      return false;
    }
  }
  setLoggedInClass(){
    const elementsLogout = document.getElementsByClassName('loggedOut');
    const elementsLogin = document.getElementsByClassName('loggedIn');
    
    const elementsLogoutM = document.getElementsByClassName('loggedOutMobile');
    const elementsLoginM = document.getElementsByClassName('loggedInMobile');

    if (this.state.auth.id) {
      for (let i = 0; i < elementsLogin.length; i++) {
        const element = elementsLogin[i];
        element.style = 'display: unset';
      }
      for (let i = 0; i < elementsLogout.length; i++) {
        const element = elementsLogout[i];
        element.style = 'display: none';
      }
      for (let i = 0; i < elementsLoginM.length; i++) {
        const element = elementsLoginM[i];
        element.style = 'display: list-item';
      }
      for (let i = 0; i < elementsLogoutM.length; i++) {
        const element = elementsLogoutM[i];
        element.style = 'display: none';
      }
    } else {
      for (let i = 0; i < elementsLogin.length; i++) {
        const element = elementsLogin[i];
        element.style = 'display: none';
      }
      for (let i = 0; i < elementsLogout.length; i++) {
        const element = elementsLogout[i];
        element.style = 'display: unset';
      }
      for (let i = 0; i < elementsLoginM.length; i++) {
        const element = elementsLoginM[i];
        element.style = 'display: none';
      }
      for (let i = 0; i < elementsLogoutM.length; i++) {
        const element = elementsLogoutM[i];
        element.style = 'display: list-item';
      }
    }
  }
  _setBadge(num = 0) {
    num = typeof num === 'number' && num > 0 ? num : 0;
    const badges = document.querySelectorAll('[id=badge]');
    if (num) {
      for (let i = 0; i < badges.length; i++) {
        const element = badges[i];
        element.style = 'display: inline-flex';
        element.innerText = num;
      }
    } else {
      for (let i = 0; i < badges.length; i++) {
        const element = badges[i];
        element.style = 'display: none';
      }
    }
  }
}
let app = {};
window.onload = () => {
  app = new AppConfig();
  app.setLoggedInClass();

  document.querySelectorAll('[id=logoutButton]').forEach(element => {
    element.onclick = () => {
      if (app.logout()) {
        window.location = '/';
      }
    };
  });
};
