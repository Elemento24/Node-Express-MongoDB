class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'Fail' : 'Error';
    this.isOperational = true;

    // This makes sure when the constructor function is called, and a new function is created, in that case, the function call is not gonna pollute the Stack Trace
    Error.captureStackTrace(this, this.constructor);
  }
};

module.exports = AppError;