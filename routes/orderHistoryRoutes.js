const express = require('express');
const orderHistoryController = require('../controllers/voucherCartController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all order history routes
router.use(authController.protect);

// Get user's order history
router.get('/', orderHistoryController.getOrderHistory);

module.exports = router;
