const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(err => err.msg).join(', ');
    return res.status(422).json({
      success: false,
      message: errorMsg,
      errors: errors.array(),
      data: null,
    });
  }
  next();
};

module.exports = validate;
