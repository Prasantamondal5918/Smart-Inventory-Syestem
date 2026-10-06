const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { stockValidator } = require('../validators/stock.validator');

router.use(protect);

router.post('/', stockValidator, validate, stockController.addStock);
router.get('/', stockController.getStockLogs);
router.get('/:productId', stockController.getStockByProduct);

module.exports = router;
