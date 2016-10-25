import debug from 'debug';

export const ACL_ERROR = new Error('RouteKeeperACLError');
ACL_ERROR.name = 'RouteKeeperACLError';

export const PARAMS_ERROR = new Error('RouteKeeperParameterError');
PARAMS_ERROR.name = 'RouteKeeperParameterError';

const debugErr = debug('RouteKeeper:Error');

function defaultErrorHandler (err, req, res) {
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
      debugErr(err);

      res.status(500);
      res.json({
        message: 'Server Error'
      });
      break;
  }
};

let _handler = defaultErrorHandler;

export function setHandler(handler) {
  _handler = handler;
};

export function getHandler() {
  return _handler;
};
