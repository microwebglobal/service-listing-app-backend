const ResponseHandler = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    return ResponseHandler.error(
      res,
      'Validation Error',
      400,
      err.errors.map(e => ({ field: e.path, message: e.message }))
    );
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseHandler.error(
      res,
      'Duplicate Entry',
      409,
      err.errors.map(e => ({ field: e.path, message: e.message }))
    );
  }

  return ResponseHandler.error(
    res,
    err.message || 'Internal Server Error',
    err.statusCode || 500,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = errorHandler;