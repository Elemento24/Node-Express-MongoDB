const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please try another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, Trusted Error: Send Message to the Client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or other unknown error: Don't leak error details
  else {
    // 1) Log Error
    console.error('ERROR ERROR ERROR!', err);

    // 2) Send General Response
    res.status(500).json({
      status: 'Error',
      message: 'Something Went very wrong!'
    });
  }
};

const handleJWTError = () => new AppError('Invalid Token, Please Log in Again!', 401);

const handleJWTExpire = () => new AppError('Your Token has Expire. Please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.kind === 'ObjectId')
      error = handleCastErrorDB(error);

    if (error.code === 11000)
      error = handleDuplicateFieldsDB(error);

    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError')
      error = handleJWTError();

    if (error.name === 'TokenExpiredError')
      error = handleJWTExpire();

    sendErrorProd(error, res);
  }
};