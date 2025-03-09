const express = require('express');
const cartController = require('../controllers/voucherCartController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all cart routes
router.use(authController.protect);

// Cart Management Routes
router.get('/', cartController.getCart); // Get user's cart
router.post('/add', cartController.addToCart); // Add item to cart
router.delete('/remove/:voucherId', cartController.removeFromCart); // Remove item from cart
router.post('/clear', cartController.clearCart); // Clear entire cart

module.exports = router;
