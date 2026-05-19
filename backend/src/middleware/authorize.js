const httpError = require('../utils/httpError');

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'Acces reserve a ce role.'));
    }

    return next();
  };
}

module.exports = authorize;
