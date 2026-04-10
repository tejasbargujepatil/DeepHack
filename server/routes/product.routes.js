const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { productSchema } = require('../utils/validators');

router.get('/', productController.getAllProducts);
router.get('/:identifier', productController.getProduct);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/admin/my',   productController.getAdminProducts); // own products only
router.post('/',          productController.createProduct);
router.put('/:id',        productController.updateProduct);
router.delete('/:id',     productController.deleteProduct);

module.exports = router;

