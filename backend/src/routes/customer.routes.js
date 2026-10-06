const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', customerController.getCustomers);
router.post('/', customerController.createCustomer);

module.exports = router;
