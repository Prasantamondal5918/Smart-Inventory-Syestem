const { check } = require('express-validator');

const registerValidator = [
  check('shopName', 'Shop name is required').notEmpty().trim(),
  check('ownerName', 'Owner name is required').notEmpty().trim(),
  check('email', 'Valid email is required').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('phone', 'Phone number is required').notEmpty().trim(),
  check('businessType', 'Business type is required').notEmpty().trim(),
];

const loginValidator = [
  check('email', 'Valid email is required').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty(),
];

module.exports = {
  registerValidator,
  loginValidator,
};
