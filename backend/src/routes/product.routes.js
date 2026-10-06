const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validation.middleware');
const { productValidator } = require('../validators/product.validator');

router.use(protect);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

router.post('/', authorize('owner'), upload.single('image'), productValidator, validate, productController.createProduct);
router.put('/:id', authorize('owner'), upload.single('image'), productController.updateProduct);
router.delete('/:id', authorize('owner'), productController.deleteProduct);

module.exports = router;
