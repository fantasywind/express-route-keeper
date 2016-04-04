# Express Route Keeper

__Important!__ This project is in development, README.md is draft API.

This project is a route middleware for acls and parameter checker.

## Installation

```
npm i express-route-keeper
```

## Usage

```javascript
import express from 'express';
import bodyParser from 'body-parser';
import routeKeeper from 'express-route-keeper';

const app = express();

// middleware for request body parse
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(bodyParser.json());

// acl role injection
app.use((req, res, next) => {
  req.aclActions = [
    READ_PROJECT,
    CREATE_PROJECT,
    PROJECT_MASTER
  ];
  
  next();
});

app.use(routeKeeper());

// public route
app.get('/news', routeHandler);

// acl route
app.get('/projects', READ_PROJECT, routeHandler);
app.get('/projects', [READ_PROJECT, PROJECT_MASTER], routeHandler); // AND match
app.get('/projects', [READ_PROJECT, PROJECT_MASTER], true, routeHandler); // OR match

// parameter checker
app.post('/login', {
  username: String,
  password: String,
  memorize: {
    type: Boolean,
    defaultValue: false,
    required: false,
  },
}, routeHandler);

// mixed mode
app.post('/projects', {
  acl: [
    CREATE_PROJECT,
    PROJECT_MASTER
  ],
  name: String,
}, routeHandler);

app.listen(PORT);
```

### Set custom exception

```javascript
app.use(routeKeeper((err, req, res) => {
  switch (err.name) {
  
    case 'RouteKeeperParameterError':
      res.status(401);
      res.json({
        message: 'Invalid Parameter',
      });
      break;
    
    case 'RouteKeeperACLError':
      res.status(401);
      res.json({
        message: 'Authentication Failed',
      });
      break;
    
    default:
      console.error(err);
      
      res.status(500);
      res.json({
        message: 'Server Error'
      });
      break;
  }
}));
```

### Action Keys

You can use String or ES6 Symbol (Recommend) for action keys.

### Querystring or Body

If request method is __GET__, check the querystring in ```req.query``` or check parameters in ```req.body```.
