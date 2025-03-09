const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const voucherCartController = require('../controllers/voucherCartController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getLandingPage);

module.exports = router;
