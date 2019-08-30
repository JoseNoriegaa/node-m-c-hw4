# Pizza delivery - APP

This is the homework assignment 4 of the course "[Node JS masterClass](https://pirple.thinkific.com/courses/the-nodejs-master-class)".

These are some features that I considered to make the project:
- ECMAScript 6
- Async/Await
- [Airbnb JS Style Guide](https://github.com/airbnb/javascript)
- Functionality inspired on [Express.JS](https://expressjs.com)
- x-www-form-urlencoded request support
- JSON request support
- [HTTP](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol)/[HTTPS](https://en.wikipedia.org/wiki/HTTPS) support
- Implementation of online payments with the [Stripe API](https://stripe.com/docs/api)
- Implementation of notifications by email with [Mailgun API](https://documentation.mailgun.com/en/latest/api_reference.html)
- No [NPM](https://docs.npmjs.com/about-npm/) or third-party dependencies
- Static content support
- Html templates
- CLI

# CLI
| Command | Options | Example| Description |
| -- | -- | -- |  -- |
| exit | none | $ exit  | Kill the CLI (and the rest of the application)  |
| clear | none | $ clear  | It clears the screen or console window of commands. |
| man | none | $ man | Show this help page |
| help | none | $ help  | Show this help page |
| product | --all, --one {product name} | $ product --one pizza | Show info about available products |
| user | --all, --one {email} | $ user --all | Show info about registed users |
| last sessions | none | $ last sessions | Show the users who have signed up in the last 24 hours. |
| orders | --last, --id {value} | $ orders --last  | Get a specific order by the id or get the all orders registered in the last 24 hours. |

# Web App
| Route | Method | Requires auth |
|--|--|--|
| / | GET | false |
| /login | GET | false |
| /signup | GET | false |
| /order | GET | true |
| /profile | GET | true |

# Backend
## Routes 
#### USERS
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/users | GET | none | none | Returns all registered users |
| /api/user | GET | **queryString**: username | none | Returns a specified user by the username field.|
| /api/user | POST | **body**: username, fullname, email, address, and password.| none | Creates a new user |
| /api/user | POST | **queryString**: username | **body**: fullname, email, address, and password. | this route updates a specific user by the username field, all the fields that are provided will be updated.|

#### Products
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/products | GET | **headers**: token; **queryString**: id | none | Get items |
| /api/product | GET | **headers**: token | none | Get a specific item |
| /api/product | POST | **headers**: token; **body**: name, price, description, currency, urlImage| none | Create a new item |
| /api/product | PUT |  **headers**: token; **queryString**: id |  **body**: name, price, description, currency, urlImage | Update a specific item |
| /api/product | DELETE | **headers**: token; **queryString**: id | none | Delete a specific item |

#### Auth
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/auth/login | POST | **body**: username, password | none | Login |
| /api/auth/logout | POST | **headers**: token | none | Logout |

#### Orders
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /api/orders | GET | **headers**: token | none | Get the orders |
| /api/order | GET | **headers**: token; **queryString**: username | none | Get the orders related to a user |
| /api/order/item | POST | **headers**: token; **body**: username, productId, quantity | none | Add item to a order |
| /api/order/item | DELETE | **headers**: token; **body**: username, productId | none | remove item from a order |
| /api/order | DELETE | **headers**: token; **queryString**: username | none | Delete a order |
| /api/order/pay | POST | **headers**: token, stripeSource; **queryString**: username | none | Order payment |

# Run it locally

- Clone this repo
  ```console
  $ git clone https://github.com/JoseNoriegaa/node-m-c-hw4.git
  ```
- set the environment variables
  ```text
  STRIPE_PK=YOUR_STRIPE_PUBLIC_KEY
  STRIPE_SK=YOUR_STRIPE_SECRET_KEY
  MAILGUN_DOMAIN=YOUR_MAILGUN_DOMAIN
  MAILGUN_API_KEY=YOUR_MAILGUN_API_KEY
  MAINGUN_SENDER=Pizza App <postmaster@YOUR_MAILGUN_DOMAIN>
  ```
- Run the proyect:
  ```console
  $ cd node-m-c-hw4
  $ node index
  ```

<p style="width:100%; text-align:center">
  <strong>Jose Noriega</strong>
  <br>
  Node version: v11.1.0
</p>