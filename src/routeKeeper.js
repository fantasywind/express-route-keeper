import 'core-js/shim';
import _ from 'lodash';

import {
  setHandler,
  PARAMS_ERROR as _PARAMS_ERROR,
  ACL_ERROR as _ACL_ERROR,
} from './errorHandler.js';
import middlewareMaker from './middlewareMaker.js';

export const ACL_ERROR = _ACL_ERROR;
export const PARAMS_ERROR = _PARAMS_ERROR;

export default function (options) {
  if (options) {
    if (_.isFunction(options)) {
      setHandler(options);
    } else if (_.isObject(options)) {
      setHandler(options.onError || _errorHandler);
    }
  }

  return middlewareMaker;
};
