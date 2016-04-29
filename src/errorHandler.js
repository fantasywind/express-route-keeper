export const ACL_ERROR = new Error('RouteKeeperACLError');
ACL_ERROR.name = 'RouteKeeperACLError';

export const PARAMS_ERROR = new Error('RouteKeeperParameterError');
PARAMS_ERROR.name = 'RouteKeeperParameterError';

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
      console.error(err);

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
