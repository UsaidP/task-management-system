import ApiError from "./api-error.js";

/**
 * Enterprise-grade universal async handler.
 * 
 * Works for:
 * - Express route handlers/middleware (functions with req, res, next)
 * - Service functions / utilities (generic async functions)
 *
 * @example
 * // Express route handler
 * router.post('/users', asyncHandler(createUser));
 * 
 * // Express middleware
 * router.use(asyncHandler(authMiddleware));
 * 
 * // Service function
 * const createUser = asyncHandler.service(async (userData) => {
 *   return await User.create(userData);
 * });
 * 
 * // Generic function (alias of service)
 * const riskyOperation = asyncHandler.fn(async (arg1, arg2) => {
 *   return complexOperation(arg1, arg2);
 * });
 */
const asyncHandler = (fn) => {
  const isExpressHandler = fn.length >= 2 && fn.length <= 3;

  if (isExpressHandler) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);

        // Warn in development mode if response wasn’t sent nor next() called.
        if (!res.headersSent && !res.finished && process.env.NODE_ENV === 'development') {
          console.warn(`WARNING: Handler for ${req.method} ${req.path} did not send a response or call next()`);
        }
      } catch (err) {
        handleError(err, { req, res, next });
      }
    };
  }

  // Fallback: Generic async handler for non-Express functions.
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw standardizeError(err);
    }
  };
};

/**
 * Service wrapper for functions that might not follow the Express pattern.
 * It logs critical errors and standardizes errors.
 * @param {Function} fn - The function to wrap.
 * @returns {Function} The wrapped function.
 */
asyncHandler.service = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      const standardizedError = standardizeError(err);
      if (standardizedError.statusCode >= 500) {
        logServerError(standardizedError, {
          functionName: fn.name || 'anonymous',
          arguments: args.map(arg => typeof arg).join(', ')
        });
      }
      throw standardizedError;
    }
  };
};

// Alias: Generic function wrapper is the same as service.
asyncHandler.fn = asyncHandler.service;

/**
 * Standardizes any error into an ApiError instance.
 * Covers Mongoose errors, JWT errors, file/upload issues, network errors,
 * timeouts, and common JavaScript errors.
 * @param {Error} err - The original error.
 * @returns {ApiError} The standardized error.
 */
const standardizeError = (err) => {
  if (err instanceof ApiError) return err;

  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let errors = [];
  const success = false;

  // --- Mongoose/MongoDB Errors ---
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    if (err.errors) {
      errors = Object.keys(err.errors).map(field => ({
        field,
        message: err.errors[field].message,
        value: sanitizeErrorValue(err.errors[field].value)
      }));
      if (errors.length > 0) {
        message = `Validation failed: ${errors.map(e => e.message).join(', ')}`;
      }
    }
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = [{
      field: err.path,
      message: `Expected ${err.kind}, got ${typeof err.value}`,
      value: sanitizeErrorValue(err.value)
    }];
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value for ${field}`;
    errors = [{
      field,
      message: `${field} already exists`,
      value: sanitizeErrorValue(value)
    }];
  }
  // --- JWT Errors ---
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    errors = [{ message: err.message }];
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
    errors = [{ message: 'Please log in again' }];
  }
  // --- File/Upload Errors ---
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large';
    errors = [{ message: `Maximum file size is ${err.limit / (1024 * 1024)}MB` }];
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file upload';
    errors = [{ message: `Field "${err.field}" was not expected` }];
  }
  // --- Network/External Service Errors ---
  else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    errors = [{ message: 'External service connection failed' }];
  }
  // --- Common JavaScript Errors ---
  else if (err instanceof SyntaxError) {
    statusCode = err.status === 400 ? 400 : 500;
    message = err.status === 400 ? 'Invalid JSON' : 'Server configuration error';
    errors = [{ message: err.status === 400 ? 'Invalid request body' : 'Internal syntax error' }];
  } else if (err instanceof TypeError) {
    statusCode = 500;
    message = 'Server encountered an error';
    errors = [{ message: process.env.NODE_ENV === 'development' ? err.message : 'Type error' }];
  }
  // --- Request Timeout ---
  else if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    statusCode = 504;
    message = 'Request timed out';
    errors = [{ message: 'Operation took too long to complete' }];
  }
  // --- Rate Limiting ---
  else if (err.statusCode === 429) {
    statusCode = 429;
    message = 'Too many requests';
    errors = [{ message: 'Please try again later' }];
  }

  return new ApiError(
    statusCode,
    message,
    errors,
    process.env.NODE_ENV === 'production' ? null : err.stack,
    success
  );
};

/**
 * Handles errors from Express handlers by standardizing, logging, and responding.
 * Use this in your Express error handling middleware.
 * @param {Error} err - The caught error.
 * @param {Object} context - Must include { req, res, next }.
 */
const handleError = (err, { req, res, next }) => {
  const requestInfo = req ? {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: typeof req.get === 'function' ? req.get('user-agent') : (req.headers?.['user-agent'] || 'unknown'),
    userId: req.user?._id || 'unauthenticated'
  } : { context: 'Non-request context' };

  const standardizedError = standardizeError(err);

  if (standardizedError.statusCode >= 500) {
    logServerError(standardizedError, requestInfo);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`CLIENT_ERROR: [${standardizedError.statusCode}] ${standardizedError.message}`, {
      path: req?.path,
      method: req?.method,
      errors: standardizedError.errors
    });
  }

  // If next is a function, pass the error to the next middleware.
  if (typeof next === 'function') {
    return next(standardizedError);
  }

  // Check if res is a valid Express response object before using it.
  if (res && typeof res.status === 'function' && !res.headersSent) {
    return res.status(standardizedError.statusCode).json({
      success: false,
      message: standardizedError.message,
      errors: standardizedError.errors,
      statusCode: standardizedError.statusCode,
      stack: process.env.NODE_ENV === 'development' ? standardizedError.stack : undefined
    });
  }

  // Fallback: Log the error if neither next nor a valid res is available.
  console.error('Unhandled error occurred without a valid Express response:', standardizedError);
};

/**
 * Logs server errors with contextual information.
 * In production, integrate with external monitoring services.
 * @param {Error} err - The error to log.
 * @param {Object} contextInfo - Contextual data (e.g., function name, request info).
 * @param {string} [level='ERROR'] - The logging level.
 */
const logServerError = (err, contextInfo, level = 'ERROR') => {
  console.error(`[${level}] Server error:`, {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    context: contextInfo,
    errorName: err.name,
    errorCode: err.code,
    statusCode: err.statusCode || 500
  });
};

/**
 * Sanitizes sensitive data from error values to prevent leaking PII.
 * Checks for common patterns (passwords, tokens, emails, phone numbers) and truncates long values.
 * @param {any} value - The raw error value.
 * @returns {string} The sanitized value.
 */
const sanitizeErrorValue = (value) => {
  if (value === undefined || value === null) return 'null';
  const strValue = String(value);

  if (
    /password|token|key|secret|credential|credit|card|cvv|ssn|social|auth/i.test(strValue) ||
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(strValue) ||
    /^\+?[\d\s()-]{7,}$/.test(strValue)
  ) {
    return `[redacted ${typeof value}]`;
  }

  if (strValue.length > 100) {
    return strValue.substring(0, 97) + '...';
  }

  return strValue;
};

export { asyncHandler };
