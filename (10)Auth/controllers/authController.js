const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// This is the function that creates the TOKEN for the User based on his ID.
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  // 1) Create the Token to be sent
  const token = signToken(user._id);

  // 2) Configuring the Cookie Options according to our needs, & to the needs of the Environment
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  // 3) Setting the Token as a httpOnly Cookie
  res.cookie('jwt', token, cookieOptions);

  // 4) Removing the Password from the Output
  user.password = undefined;

  // 5) Sending the Status & Response to the User.
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
    // role: req.body.role
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if Email and Password exist
  if (!email || !password) {
    return next(new AppError('Please provide Email and Password!', 400));
  }

  // 2) Check if the User exists & Password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect Email or Password'), 401);
  }

  // If everything is OK, send the Token to the Client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {

  let token;

  // 1) Get the Token and Check if it exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not Logged In! Please log in to get Access!', 401));
  }

  // 2) Verification of the Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the User still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The User belonging to the Token no longer exists.', 401));
  }

  // 4) Check if the User changed the Password after the token was Issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed the Password! Please log in again!', 401));
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an Array
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action!', 403));
    }
    next();
  }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on Postem Email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no User with that Email Address', 404));
  }

  // 2) Generate the Random User Token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to User's Email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your Password? Submit a PATCH request with your New Password and Password Confirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this Email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token {Valid for 10 minutes}',
      message
    });

    res.status(200).json({
      status: 'Success',
      message: 'Token sent to Email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an Error sending the Email. Try again Later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User based on the Token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is User, set the New Password
  if (!user) {
    return next(new AppError('Token is Invalid or has Expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // In this case, we don't want to turn off the Validators. In fact we want them to work, to validate if the password and the confirm password are the same.
  await user.save();

  // 3) Update changedPasswordAt property for the User

  // 4) Log the User In, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the User from the Collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if the POSTed Current Password is Correct
  if (!user || !await user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Your Current Password is wrong!', 401));
  }

  // 3) If so, Update the Password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log User in, send JWT
  createSendToken(user, 200, res);
});