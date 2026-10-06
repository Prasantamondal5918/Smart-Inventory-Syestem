const { check } = require('express-validator');

const workerValidator = [
  check('name', 'Worker name is required').notEmpty().trim(),
  check('email', 'Valid email is required').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('phone', 'Phone is required').notEmpty().trim(),
  check('designation', 'Designation is required').notEmpty().trim(),
];

module.exports = {
  workerValidator,
};
