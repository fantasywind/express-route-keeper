import _ from 'lodash';

export default function (rules, body = {}) {
  _.forEach(rules, (raw, key) => {
    const rule = typeof raw !== 'object' ? { type: raw } : raw;

    body[key] = ~[undefined, null].indexOf(body[key]) ? rule.defaultValue : body[key];
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
        if (!isNaN(val) && val !== '') {
          body[key] = val = parseFloat(val);
        }

        if (val === '' && rule.defaultValue) {
          body[key] = rule.defaultValue;
        }

        if (!_.isNumber(val)) {
          throw new Error(`param \`${key}\` should be Number`);
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
        if (!_.isBoolean(val)) {
          throw new Error(`param \`${key}\` should be Boolean`);
        }
        break;
    }
  });
};
