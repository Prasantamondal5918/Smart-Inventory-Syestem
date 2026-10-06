const errorHandler = (err, req, res, next) => {
  console.error('API Error [' + req.method + ' ' + req.originalUrl + ']:', err.message);
  if (err.stack) {
    console.error(err.stack.split('\n').slice(0, 4).join('\n'));
  }

  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Request failed';

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}': ${err.value}`;
  }

  // Mongoose ValidationError (schema validation failed - show all field errors)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed: ' + fieldErrors.join(', ');
  }

  // Mongoose duplicate key (unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value: '${err.keyValue?.[field]}' is already used for '${field}'`;
  }

  // Multer (image upload) errors - client mistakes, not server crashes
  if (err.name === 'MulterError') {
    statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum allowed size is 5MB.'
        : `Image upload failed: ${err.message}`;
  } else if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    // message is already set from the error thrown in upload.middleware.js
  }

  // For genuine server errors (5xx), still mask the raw stack trace from clients
  // but keep the human-readable message (it no longer hides useful info from the developer).
  const isServerError = statusCode >= 500;
  res.status(statusCode).json({
    success: false,
    message: isServerError ? 'Something went wrong on the server. Check backend logs.' : message,
    // In development, surface the raw error so you can debug without checking the terminal
    ...(isServerError && process.env.NODE_ENV !== 'production' ? { debugMessage: message } : {}),
    data: null,
  });
};

module.exports = errorHandler;
