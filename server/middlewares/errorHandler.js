const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`${err.statusCode} — ${err.message} [${req.method} ${req.originalUrl}]`);

  const isDev = process.env.NODE_ENV === 'development';

  // Prisma known constraint errors
  if (err.code === 'P2002') {
    return res.status(400).json({ success: false, status: 'fail', message: 'A record with this value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, status: 'fail', message: 'Record not found.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, status: 'fail', message: 'Invalid token. Please log in again.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, status: 'fail', message: 'Your session has expired. Please log in again.' });
  }

  // Operational / expected errors — safe to send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors || null,
      ...(isDev && { stack: err.stack }),
    });
  }

  // Unknown programming error — don't leak internals in production
  return res.status(500).json({
    success: false,
    status: 'error',
    message: isDev ? err.message : 'Something went wrong. Please try again later.',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;
