const express = require('express');
const router = express.Router();
const salesController = require('../controllers/sales.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { saleValidator } = require('../validators/sales.validator');

router.use(protect);

router.post('/', saleValidator, validate, salesController.createSale);
router.get('/', salesController.getSales);
router.get('/:id', salesController.getSaleById);

module.exports = router;
