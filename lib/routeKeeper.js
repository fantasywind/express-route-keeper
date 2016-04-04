'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = function (app, errHandler) {
  Object.assign(app, {
    get: binder.bind(null, app.get.bind(app), errHandler),
    post: binder.bind(null, app.post.bind(app), errHandler),
    put: binder.bind(null, app.put.bind(app), errHandler),
    patch: binder.bind(null, app.patch.bind(app), errHandler),
    delete: binder.bind(null, app.delete.bind(app), errHandler)
  });

  return app;
};

require('core-js/shim');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACL_AND_MODE = Symbol('ACL_AND_MODE');
var ACL_OR_MODE = Symbol('ACL_OR_MODE');

var ACL_ERROR = new Error('RouteKeeperACLError');
ACL_ERROR.name = 'RouteKeeperACLError';

var PARAMS_ERROR = new Error('RouteKeeperParameterError');
PARAMS_ERROR.name = 'RouteKeeperParameterError';

function defaultErrorHandler(err, req, res) {
  switch (err.name) {
    case 'RouteKeeperParameterError':
      res.status(401);
      res.json({
        message: 'Invalid Parameter'
      });
      break;

    case 'RouteKeeperACLError':
      res.status(401);
      res.json({
        message: 'Authentication Failed'
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
};

function validParams(rules) {
  var body = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  _lodash2.default.forEach(rules, function (raw, key) {
    var rule = (typeof raw === 'undefined' ? 'undefined' : _typeof(raw)) !== 'object' ? { type: raw } : raw;

    body[key] = body[key] || rule.defaultValue;
    var val = body[key];

    // Skip undefined
    if (rule.required === false && val === undefined) {
      return true;
    }

    switch (rule.type) {
      case Object:
        if (!_lodash2.default.isObject(val)) {
          throw new Error('param `' + key + '` should be Object');
        }
        break;

      case String:
        if (!_lodash2.default.isString(val)) {
          throw new Error('param `' + key + '` should be String');
        }
        break;

      case Array:
        if (!_lodash2.default.isArray(val)) {
          throw new Error('param `' + key + '` should be Array');
        }
        break;

      case Number:
        if (!isNaN(val)) {
          body[key] = val = parseFloat(val);
        }

        if (!_lodash2.default.isNumber(val)) {
          throw new Error('param `' + key + '` should be Number');
        }
        break;

      case Boolean:
        if (~['true', 'false'].indexOf(val)) {
          if (val === 'true') {
            body[key] = val = true;
          } else {
            body[key] = val = false;
          }
        }
        if (!_lodash2.default.isBoolean(val)) {
          throw new Error('param `' + key + '` should be Boolean');
        }
        break;
    }
  });
};

function binder(fn) {
  var errorRoute = arguments.length <= 1 || arguments[1] === undefined ? defaultErrorHandler : arguments[1];
  var route = arguments[2];
  var options = arguments[3];
  var handler = arguments[4];

  if (options) {
    if (_lodash2.default.isFunction(options)) {
      // Default Route
      fn(route, options);
    } else {
      (function () {
        var aclMode = ACL_AND_MODE;
        var acl = _lodash2.default.isArray(options) ? options : _lodash2.default.isSymbol(options) || _lodash2.default.isString(options) ? [options] : [];
        var params = _lodash2.default.isObject(options) ? options : null;

        if (params && params.acl) {
          // ACL Params
          var aclRaw = params.acl;
          if (_lodash2.default.isArray(aclRaw)) {
            acl = aclRaw;
          } else if (_lodash2.default.isSymbol(aclRaw) || _lodash2.default.isString(aclRaw)) {
            acl.push(aclRaw);
          } else if (_lodash2.default.isObject(aclRaw) && aclRaw.actions) {
            acl = aclRaw.actions;
            aclMode = aclRaw.$or ? ACL_OR_MODE : ACL_AND_MODE;
          } else {
            throw new Error('acl should be String, Symbol, Object or Array.');
          }

          delete params.acl;
        }

        fn(route, function (req, res, next) {
          req.aclActions = req.aclActions || [];

          // ACL Validate
          var notValidAction = null;
          switch (aclMode) {
            case ACL_OR_MODE:
              if (!_lodash2.default.intersection(acl, req.aclActions).length) {
                console.error('ACL: need at least one action in: ' + acl.map(function (action) {
                  return action.toString();
                }).join(', '));
                return errorRoute(ACL_ERROR, req, res);
              }
              break;

            case ACL_AND_MODE:
              if (acl.map(function (action) {
                return ~req.aclActions.indexOf(action);
              }).some(function (r, index) {
                notValidAction = acl[index].toString();
                return !r;
              })) {
                console.error('ACL: need action: ' + notValidAction);
                return errorRoute(ACL_ERROR, req, res);
              }
              break;
          }

          // Parameters Validate
          if (params) {
            try {
              validParams(params, req.method === 'GET' ? req.query : req.body);
            } catch (e) {
              console.error(e);
              return errorRoute(PARAMS_ERROR, req, res);
            }
          }

          handler(req, res, next);
        });
      })();
    }
  } else {
    fn(route);
  }
};

;