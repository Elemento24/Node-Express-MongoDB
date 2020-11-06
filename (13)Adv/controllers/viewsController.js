const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Tours Data from the Collection
  const tours = await Tour.find();

  // 3) Build Template & Render that template using Tour Data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the Data, for the requested tour(Including Reviews and Guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review ratings user'
  });

  if (!tour) {
    return next(new AppError('There is no Tour with that name!', 404));
  }

  // 2) Build template & Render the template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} tour`,
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your Account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

// exports.updateUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email
//     },
//     {
//       new: true,
//       runValidators: true
//     }
//   );
//   res.status(200).render('account', {
//     title: 'Your Account',
//     user: updatedUser
//   });
// });