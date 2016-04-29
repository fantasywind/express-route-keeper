'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  var errorRoute = (0, _errorHandler.getHandler)();
  var _options = options;

  return function (req, res, next) {
    var aclMode = ACL_AND_MODE;
    var acl = _lodash2.default.isArray(options) ? options : _lodash2.default.isSymbol(options) || _lodash2.default.isString(options) ? [options] : [];
    var params = _lodash2.default.isObject(options) ? _lodash2.default.cloneDeep(options) : null;

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

    req.aclActions = req.aclActions || [];

    // ACL Validate
    var notValidAction = null;
    switch (aclMode) {
      case ACL_OR_MODE:
        if (!_lodash2.default.intersection(acl, req.aclActions).length) {
          console.error('ACL: need at least one action in: ' + acl.map(function (action) {
            return action.toString();
          }).join(', '));
          return errorRoute(_errorHandler.ACL_ERROR, req, res);
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
          return errorRoute(_errorHandler.ACL_ERROR, req, res);
        }
        break;
    }

    // Parameters Validate
    if (params) {
      try {
        (0, _validParams2.default)(params, req.method === 'GET' ? req.query : req.body);
      } catch (e) {
        console.error(e);
        return errorRoute(_errorHandler.PARAMS_ERROR, req, res);
      }
    }

    next();
  };
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _errorHandler = require('./errorHandler.js');

var _validParams = require('./validParams.js');

var _validParams2 = _interopRequireDefault(_validParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACL_AND_MODE = Symbol('ACL_AND_MODE');
var ACL_OR_MODE = Symbol('ACL_OR_MODE');

;