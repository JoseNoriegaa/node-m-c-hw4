# Pizza delivery - REST API

This is the homework assignment 2 of the course "[Node JS masterClass](https://pirple.thinkific.com/courses/the-nodejs-master-class)".

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
## Routes
#### USERS
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
|/users| GET | none | none | Returns all registered users |
|/user | GET | **queryString**: username | none | Returns a specified user by the username field.|
|/user | POST | **body**: username, fullname, email, address, and password.| none | Create a new user |
| /user| POST | **queryString**: username | **body**: fullname, email, address, and password. | this route updates a specific user by the username field, all the fields that are provided will be updated.|

#### Products
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /products | GET | **headers**: token; **queryString**: id | none | Get all items |
| /product | GET | **headers**: token | none | Get a specified item by the id |
| /product | POST | **headers**: token; **body**: name, price, description, currency, urlImage| none | Create a new item |
| /product | PUT |  **headers**: token; **queryString**: id |  **body**: name, price, description, currency, urlImage | Update a specified item by the id |
| /product | DELETE | **headers**: token; **queryString**: id | none | Delete a specified item by the id |

#### Auth
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /auth/login | POST | **body**: username, password | none | Login |
| /auth/logout | POST | **headers**: token | none | Logout |

#### Orders
| Route | Method | Required Data | Optional Data | Description |
|--|--|--|--|--|
| /orders | GET | **headers**: token | none | Get all orders |
| /order | GET | **headers**: token; **queryString**: username | none | Get all orders related to a user |
| /order/item | POST | **headers**: token; **body**: username, productId, quantity | none | Add item to the order |
| /order/item | DELETE | **headers**: token; **body**: username, productId | none | remove item to the order |
| /order | DELETE | **headers**: token; **queryString**: username | none | Delete the order |
| /order/pay | POST | **headers**: token, strp_source; **queryString**: username | none | Order payment |