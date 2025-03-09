const express = require('express');
const voucherController = require('../controllers/voucherCartController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public Routes
router.get('/', voucherController.getAllVouchers);
router.get('/:id', voucherController.getVoucher);

// Admin Routes (Protected)
router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  voucherController.createVoucher,
);
router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  voucherController.updateVoucher,
);
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  voucherController.deleteVoucher,
);

// User Cart & Redemption Routes (Protected)
router.post(
  '/add-to-cart',
  authController.protect,
  voucherController.addToCart,
);
router.post(
  '/redeem',
  authController.protect,
  voucherController.redeemVouchers,
);

module.exports = router;
