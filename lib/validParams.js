'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (rules) {
  var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _lodash2.default.forEach(rules, function (raw, key) {
    var rule = (typeof raw === 'undefined' ? 'undefined' : _typeof(raw)) !== 'object' ? { type: raw } : raw;

    body[key] = ~[undefined, null].indexOf(body[key]) ? rule.defaultValue : body[key];
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
        if (!isNaN(val) && val !== '') {
          body[key] = val = parseFloat(val);
        }

        if (val === '' && rule.defaultValue !== undefined) {
          body[key] = val = rule.defaultValue;
        }

        if (!_lodash2.default.isNumber(val)) {
          throw new Error('param `' + key + '` should be Number');
        }
        break;

      case Boolean:
        if (~['true', 'false', true, false].indexOf(val)) {
          if (val === 'true' || val === true) {
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

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;