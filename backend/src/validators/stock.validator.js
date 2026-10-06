const { check } = require('express-validator');

const stockValidator = [
  check('productId', 'Product ID is required').notEmpty().isMongoId(),
  check('quantity', 'Quantity must be a positive integer').isInt({ min: 1 }),
];

module.exports = {
  stockValidator,
};
