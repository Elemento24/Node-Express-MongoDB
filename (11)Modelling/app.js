const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// ===============
// MIDDLEWARE
// ===============

// Set Security HTTP Headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development')
  app.use(morgan('dev'));

// Limiting Requests from the same IP -> This means that we allow upto 100 requests, in 1 hour, to our API, from a single IP address. This helps us to protect our API against Brute Force attacks.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many Requests from this IP, please try again in an Hour!'
});
app.use('/api', limiter);

// Body Parser -> Reading Data from body into req.body
app.use(express.json({
  limit: '10kb'
}));

// Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// =======
// ROUTES
// =======

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server!`, 404));
});

// By Specifying 4 Parameters, Express already knows that it's an Error Handling Middleware, and will only call it, when there is an Error
app.use(globalErrorHandler);

module.exports = app;