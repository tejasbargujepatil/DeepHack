const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth');

// Protect all routes
router.use(protect);

router.post('/create-razorpay-order', paymentController.createRazorpayOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/cod', paymentController.placeCOD);

module.exports = router;
