const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// ─── Customer Routes ─────────────────────────────────────────────────────────
router.get('/profile', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.patch('/update-password', userController.updatePassword);

// Cart
router.post('/cart', userController.addToCart);
router.delete('/cart/:productId', userController.removeFromCart);
router.get('/cart', userController.getCart);

// Wishlist
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);
router.get('/wishlist', userController.getWishlist);

// Addresses
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.delete('/addresses/:id', userController.deleteAddress);

// ─── SUPER_ADMIN Only Routes ──────────────────────────────────────────────────
// IMPORTANT: define /admins BEFORE /:id so Express doesn't catch it as a param
router.get('/', restrictTo('SUPER_ADMIN'), userController.getAllUsers);
router.get('/admins', restrictTo('SUPER_ADMIN'), userController.getAllAdmins);
router.get('/:id', restrictTo('SUPER_ADMIN'), userController.getUser);
router.patch('/:id/block', restrictTo('SUPER_ADMIN'), userController.toggleBlockStatus);
router.patch('/:id/role', restrictTo('SUPER_ADMIN'), userController.updateRole);

module.exports = router;
