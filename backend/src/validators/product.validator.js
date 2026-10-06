const { check } = require('express-validator');

const productValidator = [
  check('productName', 'Product name is required').notEmpty().trim(),
  check('purchasePrice', 'Purchase price must be a valid number').isFloat({ min: 0 }),
  check('sellingPrice', 'Selling price must be a valid number').isFloat({ min: 0 }),
  check('category', 'Category is required').notEmpty().trim(),
];

module.exports = {
  productValidator,
};
