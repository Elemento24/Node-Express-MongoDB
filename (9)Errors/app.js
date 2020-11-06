const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// ===============
// MIDDLEWARE
// ===============

if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// =======
// ROUTES
// =======

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server!`, 404));
});

// By Specifying 4 Parameters, Express already knows that it's an Error Handling Middleware, and will only call it, when there is an Error
app.use(globalErrorHandler);

module.exports = app;