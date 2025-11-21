/**
 * Error Handling Middleware
 *
 * Centralized 404 and global error handlers.
 */

/**
 * 404 Not Found handler for unmatched routes.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle MongoDB timeout errors
  if (err.name === 'MongooseError' || message.includes('buffering timed out')) {
    statusCode = 503;
    message = 'Database connection timeout. Please try again.';
    console.error('MongoDB Error:', err.message);
  }

  // Handle MongoDB connection errors
  if (message.includes('connect ECONNREFUSED') || message.includes('getaddrinfo ENOTFOUND')) {
    statusCode = 503;
    message = 'Database service unavailable. Please try again later.';
    console.error('Connection Error:', err.message);
  }

  // Log detailed errors in production
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${new Date().toISOString()}] Error:`, {
      status: statusCode,
      message: err.message,
      path: req.originalUrl,
      method: req.method
    });
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};