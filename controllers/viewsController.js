const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

const AppError = require('../utils/appError');

exports.getLandingPage = catchAsync(async (req, res, next) => {
  res.status(200).render('landingPage', {
    title: 'Welcome to Voucherify',
  });
});
