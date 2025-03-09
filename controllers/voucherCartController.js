const { Voucher, Cart, OrderHistory } = require('../models/voucherCartModels');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get All Vouchers
exports.getAllVouchers = catchAsync(async (req, res, next) => {
  const vouchers = await Voucher.find();
  res.status(200).json({
    status: 'success',
    results: vouchers.length,
    data: { vouchers },
  });
});

// Get Single Voucher
exports.getVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findById(req.params.id);
  if (!voucher) return next(new AppError('No voucher found with that ID', 404));
  res.status(200).json({ status: 'success', data: { voucher } });
});

// Create New Voucher (Admin Only)
exports.createVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.create(req.body);
  res.status(201).json({ status: 'success', data: { voucher } });
});

// Update Voucher (Admin Only)
exports.updateVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!voucher) return next(new AppError('No voucher found with that ID', 404));
  res.status(200).json({ status: 'success', data: { voucher } });
});

// Delete Voucher (Admin Only)
exports.deleteVoucher = catchAsync(async (req, res, next) => {
  const voucher = await Voucher.findByIdAndDelete(req.params.id);
  if (!voucher) return next(new AppError('No voucher found with that ID', 404));
  res.status(204).json({ status: 'success', data: null });
});

// Get User's Cart
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'vouchers.voucher',
  );
  if (!cart) return next(new AppError('Cart not found', 404));
  res.status(200).json({ status: 'success', data: { cart } });
});

// Add Voucher to Cart
exports.addToCart = catchAsync(async (req, res, next) => {
  const { voucherId, quantity } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, vouchers: [] });

  cart.vouchers.push({ voucher: voucherId, quantity });
  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});

// Remove Voucher from Cart
exports.removeFromCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new AppError('Cart not found', 404));

  cart.vouchers = cart.vouchers.filter(
    (item) => item.voucher.toString() !== req.params.voucherId,
  );
  await cart.save();
  res.status(200).json({ status: 'success', data: { cart } });
});

// Clear Cart
exports.clearCart = catchAsync(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).json({ status: 'success', data: null });
});

// Redeem Vouchers
exports.redeemVouchers = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  let cart = await Cart.findOne({ user: req.user.id }).populate(
    'vouchers.voucher',
  );

  if (!cart || cart.vouchers.length === 0)
    return next(new AppError('Cart is empty', 400));

  let totalPointsRequired = 0;
  cart.vouchers.forEach((item) => {
    totalPointsRequired += item.quantity * item.voucher.pointsRequired;
  });

  if (user.points < totalPointsRequired)
    return next(new AppError('Insufficient points', 400));

  const order = await OrderHistory.create({
    user: req.user.id,
    vouchers: cart.vouchers,
    totalPointsUsed: totalPointsRequired,
  });

  user.points -= totalPointsRequired;
  await user.save();
  await Cart.findOneAndDelete({ user: req.user.id });

  res.status(200).json({ status: 'success', data: { order } });
});

// Get Order History
exports.getOrderHistory = catchAsync(async (req, res, next) => {
  const orders = await OrderHistory.find({ user: req.user.id }).populate(
    'vouchers.voucher',
  );
  res.status(200).json({ status: 'success', data: { orders } });
});
