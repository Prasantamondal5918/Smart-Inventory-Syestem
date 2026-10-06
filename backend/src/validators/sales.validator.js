const { check } = require('express-validator');

const saleValidator = [
  check('products', 'Products list is required and cannot be empty').isArray({ min: 1 }),
  check('products.*.productId', 'Valid product ID required').isMongoId(),
  check('products.*.quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
  check('paymentMethod', 'Payment method is required').isIn(['cash', 'card', 'upi', 'other']),
];

module.exports = {
  saleValidator,
};
