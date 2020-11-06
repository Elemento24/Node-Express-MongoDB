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

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR ERROR ERROR!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, Trusted Error: Send Message to the Client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // B) Programming or other unknown error: Don't leak error details
    // 1) Log Error
    console.error('ERROR ERROR ERROR!', err);

    // 2) Send General Response
    return res.status(500).json({
      status: 'error',
      message: 'Something Went very wrong!'
    });
  }

  // RENDERED WEBSITE
  // A) Operational, Trusted Error: Send Message to the Client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // B) Programming or other unknown error: Don't leak error details
  // 1) Log Error
  console.error('ERROR ERROR ERROR!', err);

  // 2) Send General Response
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!'
  });
};

const handleJWTError = () => new AppError('Invalid Token, Please Log in Again!', 401);

const handleJWTExpire = () => new AppError('Your Token has Expire. Please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

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

    sendErrorProd(error, req, res);
  }
};