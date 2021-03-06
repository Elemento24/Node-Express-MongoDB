const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el))
      newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  // ==================
  // EXECUTE THE QUERY
  // ==================
  const users = await User.find();

  // ==============
  // SEND RESPONSE
  // ==============
  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: { users }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create Error if User POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for Password Updates.Please use /updateMyPassword.', 400));
  }

  // 2) Filtered out unwanted Field Names that are not allowed to be Updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update User Document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false
  });

  res.status(204).json({
    status: 'Success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet implemented!'
  });
};
