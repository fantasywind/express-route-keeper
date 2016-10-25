'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARAMS_ERROR = exports.ACL_ERROR = undefined;
exports.setHandler = setHandler;
exports.getHandler = getHandler;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACL_ERROR = exports.ACL_ERROR = new Error('RouteKeeperACLError');
ACL_ERROR.name = 'RouteKeeperACLError';

var PARAMS_ERROR = exports.PARAMS_ERROR = new Error('RouteKeeperParameterError');
PARAMS_ERROR.name = 'RouteKeeperParameterError';

var debugErr = (0, _debug2.default)('RouteKeeper:Error');

function defaultErrorHandler(err, req, res) {
  switch (err) {
    case PARAMS_ERROR:
      res.status(401);
      res.json({
        message: 'Invalid Parameter'
      });
      break;

    case ACL_ERROR:
      res.status(401);
      res.json({
        message: 'Authentication Failed'
      });
      break;

    default:
      debugErr(err);

      res.status(500);
      res.json({
        message: 'Server Error'
      });
      break;
  }
};

var _handler = defaultErrorHandler;

function setHandler(handler) {
  _handler = handler;
};

function getHandler() {
  return _handler;
};