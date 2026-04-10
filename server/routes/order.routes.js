const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { orderSchema } = require('../utils/validators');

// All order routes require authentication
router.use(protect);

// Customer Routes
router.post('/', validate(orderSchema), orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin Routes
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));
router.get('/', orderController.getAllOrders);
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
