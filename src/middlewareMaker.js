import _ from 'lodash';

import {
  ACL_ERROR,
  PARAMS_ERROR,
  getHandler as getErrorHandler,
} from './errorHandler.js';

import validParams from './validParams.js';

const ACL_AND_MODE = Symbol('ACL_AND_MODE');
const ACL_OR_MODE = Symbol('ACL_OR_MODE');

export default function (options) {
  const errorRoute = getErrorHandler();
  const _options = options;

  return function (req, res, next) {
    let aclMode = ACL_AND_MODE;
    let acl = _.isArray(options) ? options : (_.isSymbol(options) || _.isString(options)) ? [options] : [];
    const params = _.isObject(options) ? _.cloneDeep(options) : null;

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

    next();
  };
};
