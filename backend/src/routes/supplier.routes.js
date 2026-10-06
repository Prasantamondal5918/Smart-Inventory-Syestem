const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.get('/', supplierController.getSuppliers);
router.post('/', authorize('owner'), supplierController.createSupplier);
router.put('/:id', authorize('owner'), supplierController.updateSupplier);
router.delete('/:id', authorize('owner'), supplierController.deleteSupplier);

module.exports = router;
