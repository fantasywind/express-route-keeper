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
import RouteKeeper from 'express-route-keeper';

const app = express();
const keeper = RouteKeeper();

const READ_PROJECT = Symbol('READ_PROJECT');
const CREATE_PROJECT = Symbol('CREATE_PROJECT');
const PROJECT_MASTER = Symbol('PROJECT_MASTER');

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

// public route
app.get('/news', routeHandler);

// acl route
app.get('/projects', keeper(READ_PROJECT), routeHandler);
app.get('/projects', keeper([
  READ_PROJECT,
  PROJECT_MASTER
]), routeHandler); // AND match

// parameter checker
app.post('/login', keeper({
  username: String,
  password: String,
  memorize: {
    type: Boolean,
    defaultValue: false,
    required: false,
  },
}), routeHandler);

// mixed mode
app.post('/projects', keeper({
  acl: [
    CREATE_PROJECT,
    PROJECT_MASTER
  ],
  name: String,
}), routeHandler);

app.listen(PORT);
```

### ACL OR match

```javascript
app.post('/projects', ({
  acl: {
    actions: [
      CREATE_PROJECT,
      PROJECT_MASTER
    ],
    $or: true,
  },
  name: String,
}), routeHandler);
```

### Working with other middleware

```javascript
// General Usage
// Check ACL before uploaded file handler
app.post('/projects', keeper(CREATE_PROJECT), multer.single('cover'), routeHandler);

// Body field checker with multipart
app.post('/projects', multer.single('cover'), keeper({
  name: String,
  managerId: Number,
  acl: [
    CREATE_PROJECT
  ],
}), routeHandler);
```

### Set custom exception

```javascript
import RouteKeeper, {
  PARAMS_ERROR,
  ACL_ERROR
} from 'express-route-keeper';

const keeper = RouteKeeper((err, req, res) => {
  switch (err) {
    case PARAMS_ERROR:
      res.status(401);
      res.json({
        message: 'Invalid Parameter',
      });
      break;

    case ACL_ERROR:
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
});
```

### Action Keys

You can use String or ES6 Symbol (Recommend) for action keys.

### Querystring or Body

If request method is __GET__, check the querystring in ```req.query``` or check parameters in ```req.body```.
