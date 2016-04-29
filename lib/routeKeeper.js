'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARAMS_ERROR = exports.ACL_ERROR = undefined;

exports.default = function (options) {
  if (options) {
    if (_lodash2.default.isFunction(options)) {
      (0, _errorHandler2.setHandler)(options);
    } else if (_lodash2.default.isObject(options)) {
      (0, _errorHandler2.setHandler)(options.onError || _errorHandler);
    }
  }

  return _middlewareMaker2.default;
};

require('core-js/shim');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _errorHandler2 = require('./errorHandler.js');

var _middlewareMaker = require('./middlewareMaker.js');

var _middlewareMaker2 = _interopRequireDefault(_middlewareMaker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACL_ERROR = exports.ACL_ERROR = _errorHandler2.ACL_ERROR;
var PARAMS_ERROR = exports.PARAMS_ERROR = _errorHandler2.PARAMS_ERROR;

;