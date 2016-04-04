import 'core-js/shim';
import _ from 'lodash';

const ACL_AND_MODE = Symbol('ACL_AND_MODE');
const ACL_OR_MODE = Symbol('ACL_OR_MODE');

const ACL_ERROR = new Error('RouteKeeperACLError');
ACL_ERROR.name = 'RouteKeeperACLError';

const PARAMS_ERROR = new Error('RouteKeeperParameterError');
PARAMS_ERROR.name = 'RouteKeeperParameterError';

function defaultErrorHandler (err, req, res) {
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
};

function validParams(rules, body = {}) {
  _.forEach(rules, (raw, key) => {
    const rule = typeof raw !== 'object' ? { type: raw } : raw;

    body[key] = body[key] || rule.defaultValue;
    let val = body[key];

    // Skip undefined
    if (rule.required === false && val === undefined) {
      return true;
    }

    switch (rule.type) {
      case Object:
        if (!_.isObject(val)) {
          throw new Error(`param \`${key}\` should be Object`);
        }
        break;

      case String:
        if (!_.isString(val)) {
          throw new Error(`param \`${key}\` should be String`);
        }
        break;

      case Array:
        if (!_.isArray(val)) {
          throw new Error(`param \`${key}\` should be Array`);
        }
        break;

      case Number:
        if (!isNaN(val)) {
          body[key] = val = parseFloat(val);
        }

        if (!_.isNumber(val)) {
          throw new Error(`param \`${key}\` should be Number`);
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
        if (!_.isBoolean(val)) {
          throw new Error(`param \`${key}\` should be Boolean`);
        }
        break;
    }
  });
};

function binder(fn, errorRoute = defaultErrorHandler, route, options, handler) {
  if (options) {
    if (_.isFunction(options)) {
      // Default Route
      fn(route, options);
    } else {
      let aclMode = ACL_AND_MODE;
      let acl = _.isArray(options) ? options : (_.isSymbol(options) || _.isString(options)) ? [options] : [];
      const params = _.isObject(options) ? options : null;

      if (params && params.acl) {
        // ACL Params
        const aclRaw = params.acl;
        if (_.isArray(aclRaw)) {
          acl = aclRaw;
        } else if (_.isSymbol(aclRaw) || _.isString(aclRaw)) {
          acl.push(aclRaw);
        } else if (_.isObject(aclRaw) && aclRaw.actions){
          acl = aclRaw.actions;
          aclMode = aclRaw.$or ? ACL_OR_MODE : ACL_AND_MODE;
        } else {
          throw(new Error('acl should be String, Symbol, Object or Array.'));
        }

        delete params.acl;
      }

      fn(route, (req, res, next) => {
        req.aclActions = req.aclActions || [];

        // ACL Validate
        let notValidAction = null;
        switch (aclMode) {
          case ACL_OR_MODE:
            if (!_.intersection(acl, req.aclActions).length) {
              console.error(`ACL: need at least one action in: ${acl.map((action) => action.toString()).join(', ')}`);
              return errorRoute(ACL_ERROR, req, res);
            }
            break;

          case ACL_AND_MODE:
            if (acl.map((action) => ~req.aclActions.indexOf(action)).some((r, index) => {
              notValidAction = acl[index].toString();
              return !r
            })) {
              console.error(`ACL: need action: ${notValidAction}`);
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
    }
  } else {
    fn(route);
  }
};

export default function (app, errHandler) {
  Object.assign(app, {
    get: binder.bind(null, app.get.bind(app), errHandler),
    post: binder.bind(null, app.post.bind(app), errHandler),
    put: binder.bind(null, app.put.bind(app), errHandler),
    patch: binder.bind(null, app.patch.bind(app), errHandler),
    delete: binder.bind(null, app.delete.bind(app), errHandler),
  });

  return app;
};
