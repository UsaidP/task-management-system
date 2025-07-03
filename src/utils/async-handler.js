// import ApiError from "./api-error.js";

// /**
//  * Enterprise-grade universal async handler.
//  *
//  * Works for:
//  * - Express route handlers/middleware (functions with req, res, next)
//  * - Service functions / utilities (generic async functions)
//  *
//  * @example
//  * // Express route handler
//  * router.post('/users', asyncHandler(createUser));
//  *
//  * // Express middleware
//  * router.use(asyncHandler(authMiddleware));
//  *
//  * // Service function
//  * const createUser = asyncHandler.service(async (userData) => {
//  *   return await User.create(userData);
//  * });
//  *
//  * // Generic function (alias of service)
//  * const riskyOperation = asyncHandler.fn(async (arg1, arg2) => {
//  *   return complexOperation(arg1, arg2);
//  * });
//  */
// const asyncHandler = (fn) => {
//   const isExpressHandler = fn.length >= 2 && fn.length <= 3;

//   if (isExpressHandler) {
//     return async (req, res, next) => {
//       try {
//         await fn(req, res, next);

//         // Warn in development mode if response wasn’t sent nor next() called.
//         if (!res.headersSent && !res.finished && process.env.NODE_ENV === "development") {
//           console.warn(
//             `WARNING: Handler for ${req.method} ${req.path} did not send a response or call next()`
//           );
//         }
//       } catch (err) {
//         handleError(err, { req, res, next });
//       }
//     };
//   }

//   // Fallback: Generic async handler for non-Express functions.
//   return async (...args) => {
//     try {
//       return await fn(...args);
//     } catch (err) {
//       throw standardizeError(err);
//     }
//   };
// };

// /**
//  * Service wrapper for functions that might not follow the Express pattern.
//  * It logs critical errors and standardizes errors.
//  * @param {Function} fn - The function to wrap.
//  * @returns {Function} The wrapped function.
//  */
// asyncHandler.service = (fn) => {
//   return async (...args) => {
//     try {
//       return await fn(...args);
//     } catch (err) {
//       const standardizedError = standardizeError(err);
//       if (standardizedError.statusCode >= 500) {
//         logServerError(standardizedError, {
//           functionName: fn.name || "anonymous",
//           arguments: args.map((arg) => typeof arg).join(", "),
//         });
//       }
//       throw standardizedError;
//     }
//   };
// };

// // Alias: Generic function wrapper is the same as service.
// asyncHandler.fn = asyncHandler.service;

// /**
//  * Standardizes any error into an ApiError instance.
//  * Covers Mongoose errors, JWT errors, file/upload issues, network errors,
//  * timeouts, and common JavaScript errors.
//  * @param {Error} err - The original error.
//  * @returns {ApiError} The standardized error.
//  */
// const standardizeError = (err) => {
//   if (err instanceof ApiError) return err;

//   let statusCode = 500;
//   let message = "An unexpected error occurred";
//   let errors = [];
//   const success = false;

//   // --- Mongoose/MongoDB Errors ---
//   if (err.name === "ValidationError") {
//     statusCode = 400;
//     message = "Validation failed";
//     if (err.errors) {
//       errors = Object.keys(err.errors).map((field) => ({
//         field,
//         message: err.errors[field].message,
//         value: sanitizeErrorValue(err.errors[field].value),
//       }));
//       if (errors.length > 0) {
//         message = `Validation failed: ${errors.map((e) => e.message).join(", ")}`;
//       }
//     }
//   } else if (err.name === "CastError") {
//     statusCode = 400;
//     message = `Invalid ${err.path}: ${err.value}`;
//     errors = [
//       {
//         field: err.path,
//         message: `Expected ${err.kind}, got ${typeof err.value}`,
//         value: sanitizeErrorValue(err.value),
//       },
//     ];
//   } else if (err.code === 11000) {
//     statusCode = 409;
//     const field = Object.keys(err.keyValue || {})[0] || "field";
//     const value = err.keyValue ? err.keyValue[field] : "";
//     message = `Duplicate value for ${field}`;
//     errors = [
//       {
//         field,
//         message: `${field} already exists`,
//         value: sanitizeErrorValue(value),
//       },
//     ];
//   }
//   // --- JWT Errors ---
//   else if (err.name === "JsonWebTokenError") {
//     statusCode = 401;
//     message = "Invalid authentication token";
//     errors = [{ message: err.message }];
//   } else if (err.name === "TokenExpiredError") {
//     statusCode = 401;
//     message = "Authentication token expired";
//     errors = [{ message: "Please log in again" }];
//   }
//   // --- File/Upload Errors ---
//   else if (err.code === "LIMIT_FILE_SIZE") {
//     statusCode = 400;
//     message = "File too large";
//     errors = [{ message: `Maximum file size is ${err.limit / (1024 * 1024)}MB` }];
//   } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
//     statusCode = 400;
//     message = "Unexpected file upload";
//     errors = [{ message: `Field "${err.field}" was not expected` }];
//   }
//   // --- Network/External Service Errors ---
//   else if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
//     statusCode = 503;
//     message = "Service temporarily unavailable";
//     errors = [{ message: "External service connection failed" }];
//   }
//   // --- Common JavaScript Errors ---
//   else if (err instanceof SyntaxError) {
//     statusCode = err.status === 400 ? 400 : 500;
//     message = err.status === 400 ? "Invalid JSON" : "Server configuration error";
//     errors = [
//       {
//         message: err.status === 400 ? "Invalid request body" : "Internal syntax error",
//       },
//     ];
//   } else if (err instanceof TypeError) {
//     statusCode = 500;
//     message = "Server encountered an error";
//     errors = [
//       {
//         message: process.env.NODE_ENV === "development" ? err.message : "Type error",
//       },
//     ];
//   }
//   // --- Request Timeout ---
//   else if (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT") {
//     statusCode = 504;
//     message = "Request timed out";
//     errors = [{ message: "Operation took too long to complete" }];
//   }
//   // --- Rate Limiting ---
//   else if (err.statusCode === 429) {
//     statusCode = 429;
//     message = "Too many requests";
//     errors = [{ message: "Please try again later" }];
//   }

//   return new ApiError(
//     statusCode,
//     message,
//     errors,
//     process.env.NODE_ENV === "production" ? null : err.stack,
//     success
//   );
// };

// /**
//  * Handles errors from Express handlers by standardizing, logging, and responding.
//  * Use this in your Express error handling middleware.
//  * @param {Error} err - The caught error.
//  * @param {Object} context - Must include { req, res, next }.
//  */
// const handleError = (err, { req, res, next }) => {
//   const requestInfo = req
//     ? {
//         method: req.method,
//         path: req.path,
//         ip: req.ip,
//         userAgent:
//           typeof req.get === "function"
//             ? req.get("user-agent")
//             : req.headers?.["user-agent"] || "unknown",
//         userId: req.user?._id || "unauthenticated",
//       }
//     : { context: "Non-request context" };

//   const standardizedError = standardizeError(err);

//   if (standardizedError.statusCode >= 500) {
//     logServerError(standardizedError, requestInfo);
//   } else if (process.env.NODE_ENV === "development") {
//     console.log(`CLIENT_ERROR: [${standardizedError.statusCode}] ${standardizedError.message}`, {
//       path: req?.path,
//       method: req?.method,
//       errors: standardizedError.errors,
//     });
//   }

//   // If next is a function, pass the error to the next middleware.
//   if (typeof next === "function") {
//     return next(standardizedError);
//   }

//   // Check if res is a valid Express response object before using it.
//   if (res && typeof res.status === "function" && !res.headersSent) {
//     return res.status(standardizedError.statusCode).json({
//       success: false,
//       message: standardizedError.message,
//       errors: standardizedError.errors,
//       statusCode: standardizedError.statusCode,
//       stack: process.env.NODE_ENV === "development" ? standardizedError.stack : undefined,
//     });
//   }

//   // Fallback: Log the error if neither next nor a valid res is available.
//   console.error("Unhandled error occurred without a valid Express response:", standardizedError);
// };

// /**
//  * Logs server errors with contextual information.
//  * In production, integrate with external monitoring services.
//  * @param {Error} err - The error to log.
//  * @param {Object} contextInfo - Contextual data (e.g., function name, request info).
//  * @param {string} [level='ERROR'] - The logging level.
//  */
// const logServerError = (err, contextInfo, level = "ERROR") => {
//   console.error(`[${level}] Server error:`, {
//     message: err.message,
//     stack: err.stack,
//     timestamp: new Date().toISOString(),
//     context: contextInfo,
//     errorName: err.name,
//     errorCode: err.code,
//     statusCode: err.statusCode || 500,
//   });
// };

// /**
//  * Sanitizes sensitive data from error values to prevent leaking PII.
//  * Checks for common patterns (passwords, tokens, emails, phone numbers) and truncates long values.
//  * @param {any} value - The raw error value.
//  * @returns {string} The sanitized value.
//  */
// const sanitizeErrorValue = (value) => {
//   if (value === undefined || value === null) return "null";
//   const strValue = String(value);

//   if (
//     /password|token|key|secret|credential|credit|card|cvv|ssn|social|auth/i.test(strValue) ||
//     /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(strValue) ||
//     /^\+?[\d\s()-]{7,}$/.test(strValue)
//   ) {
//     return `[redacted ${typeof value}]`;
//   }

//   if (strValue.length > 100) {
//     return strValue.substring(0, 97) + "...";
//   }

//   return strValue;
// };

// export { asyncHandler };

import ApiError from "./api-error.js";
import { performance } from "perf_hooks";

/**
 * Production-ready universal async handler with enhanced error handling,
 * performance monitoring, and security features.
 *
 * Features:
 * - Express route handlers/middleware support
 * - Service function wrapping with auto-retry
 * - Performance monitoring and slow query detection
 * - Enhanced error standardization with security considerations
 * - Request context tracking and correlation IDs
 * - Graceful degradation and circuit breaker pattern
 * - Comprehensive logging with different levels
 * - Memory leak prevention and cleanup
 *
 * @example
 * // Express route handler
 * router.post('/users', asyncHandler(createUser));
 *
 * // Express middleware with options
 * router.use(asyncHandler(authMiddleware, { timeout: 5000 }));
 *
 * // Service function with retry
 * const createUser = asyncHandler.service(async (userData) => {
 *   return await User.create(userData);
 * }, { retry: 3, timeout: 10000 });
 *
 * // Critical operation with circuit breaker
 * const paymentService = asyncHandler.critical(async (paymentData) => {
 *   return await processPayment(paymentData);
 * }, { circuitBreaker: true });
 */

// Performance and monitoring configuration
const CONFIG = {
  SLOW_QUERY_THRESHOLD: parseInt(process.env.SLOW_QUERY_THRESHOLD) || 1000, // ms
  MAX_RETRY_ATTEMPTS: parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3,
  CIRCUIT_BREAKER_THRESHOLD: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5,
  CIRCUIT_BREAKER_TIMEOUT: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 60000, // ms
  REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT) || 30000, // ms
  ENABLE_PERFORMANCE_MONITORING: process.env.ENABLE_PERFORMANCE_MONITORING === "true",
  ENABLE_DETAILED_LOGGING:
    process.env.NODE_ENV === "development" || process.env.ENABLE_DETAILED_LOGGING === "true",
};

// Circuit breaker state management
const circuitBreakerState = new Map();

/**
 * Main async handler function with enhanced capabilities
 */
const asyncHandler = (fn, options = {}) => {
  const {
    timeout = CONFIG.REQUEST_TIMEOUT,
    retry = 0,
    circuitBreaker = false,
    performanceMonitoring = CONFIG.ENABLE_PERFORMANCE_MONITORING,
    correlationId = true,
  } = options;

  const isExpressHandler = fn.length >= 2 && fn.length <= 3;
  const handlerName = fn.name || "anonymous";

  if (isExpressHandler) {
    return async (req, res, next) => {
      const startTime = performance.now();
      const requestId = correlationId ? generateCorrelationId() : null;

      // Add correlation ID to request
      if (requestId) {
        req.correlationId = requestId;
        res.setHeader("X-Correlation-ID", requestId);
      }

      // Set request timeout
      const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
          const timeoutError = new ApiError(
            408,
            "Request timeout",
            [{ message: `Request exceeded ${timeout}ms timeout` }],
            null,
            false
          );
          handleError(timeoutError, { req, res, next });
        }
      }, timeout);

      try {
        // Circuit breaker check
        if (circuitBreaker && isCircuitBreakerOpen(handlerName)) {
          throw new ApiError(
            503,
            "Service temporarily unavailable",
            [{ message: "Circuit breaker is open" }],
            null,
            false
          );
        }

        const result = await executeWithRetry(fn, [req, res, next], retry);

        // Clear timeout on successful completion
        clearTimeout(timeoutId);

        // Record successful execution for circuit breaker
        if (circuitBreaker) {
          recordCircuitBreakerSuccess(handlerName);
        }

        // Performance monitoring
        if (performanceMonitoring) {
          const duration = performance.now() - startTime;
          monitorPerformance(handlerName, duration, req);
        }

        // Response validation
        if (!res.headersSent && !res.finished && process.env.NODE_ENV === "development") {
          console.warn(
            `[${requestId || "NO_ID"}] WARNING: Handler ${handlerName} for ${req.method} ${req.path} did not send a response or call next()`
          );
        }

        return result;
      } catch (err) {
        clearTimeout(timeoutId);

        // Record failure for circuit breaker
        if (circuitBreaker) {
          recordCircuitBreakerFailure(handlerName);
        }

        // Performance monitoring for errors
        if (performanceMonitoring) {
          const duration = performance.now() - startTime;
          monitorPerformance(handlerName, duration, req, err);
        }

        handleError(err, { req, res, next });
      }
    };
  }

  // Non-Express function handler
  return async (...args) => {
    const startTime = performance.now();

    try {
      // Circuit breaker check
      if (circuitBreaker && isCircuitBreakerOpen(handlerName)) {
        throw new ApiError(
          503,
          "Service temporarily unavailable",
          [{ message: "Circuit breaker is open" }],
          null,
          false
        );
      }

      const result = await executeWithRetry(fn, args, retry);

      // Record successful execution
      if (circuitBreaker) {
        recordCircuitBreakerSuccess(handlerName);
      }

      // Performance monitoring
      if (performanceMonitoring) {
        const duration = performance.now() - startTime;
        monitorPerformance(handlerName, duration, null);
      }

      return result;
    } catch (err) {
      // Record failure for circuit breaker
      if (circuitBreaker) {
        recordCircuitBreakerFailure(handlerName);
      }

      // Performance monitoring for errors
      if (performanceMonitoring) {
        const duration = performance.now() - startTime;
        monitorPerformance(handlerName, duration, null, err);
      }

      throw standardizeError(err);
    }
  };
};

/**
 * Service wrapper with enhanced error handling and monitoring
 */
asyncHandler.service = (fn, options = {}) => {
  const {
    retry = 1,
    timeout = CONFIG.REQUEST_TIMEOUT,
    circuitBreaker = false,
    performanceMonitoring = CONFIG.ENABLE_PERFORMANCE_MONITORING,
  } = options;

  const handlerName = fn.name || "service";

  return async (...args) => {
    const startTime = performance.now();

    try {
      // Circuit breaker check
      if (circuitBreaker && isCircuitBreakerOpen(handlerName)) {
        throw new ApiError(
          503,
          "Service temporarily unavailable",
          [{ message: "Circuit breaker is open" }],
          null,
          false
        );
      }

      const result = await executeWithRetry(fn, args, retry, timeout);

      // Record successful execution
      if (circuitBreaker) {
        recordCircuitBreakerSuccess(handlerName);
      }

      // Performance monitoring
      if (performanceMonitoring) {
        const duration = performance.now() - startTime;
        monitorPerformance(handlerName, duration, null);
      }

      return result;
    } catch (err) {
      // Record failure for circuit breaker
      if (circuitBreaker) {
        recordCircuitBreakerFailure(handlerName);
      }

      const standardizedError = standardizeError(err);

      // Enhanced logging for service errors
      if (standardizedError.statusCode >= 500) {
        logServerError(standardizedError, {
          functionName: handlerName,
          arguments: sanitizeArguments(args),
          duration: performance.now() - startTime,
          retryAttempts: retry,
        });
      }

      throw standardizedError;
    }
  };
};

/**
 * Critical operation handler with circuit breaker by default
 */
asyncHandler.critical = (fn, options = {}) => {
  return asyncHandler.service(fn, {
    circuitBreaker: true,
    performanceMonitoring: true,
    retry: 2,
    ...options,
  });
};

// Alias for backward compatibility
asyncHandler.fn = asyncHandler.service;

/**
 * Execute function with retry mechanism
 */
const executeWithRetry = async (fn, args, maxRetries = 0, timeout = CONFIG.REQUEST_TIMEOUT) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Add timeout to function execution
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Function execution timeout")), timeout);
      });

      const result = await Promise.race([fn(...args), timeoutPromise]);

      return result;
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or specific error types
      if (shouldNotRetry(error) || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (CONFIG.ENABLE_DETAILED_LOGGING) {
        console.log(
          `[RETRY] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delay}ms...`
        );
      }
    }
  }

  throw lastError;
};

/**
 * Check if error should not be retried
 */
const shouldNotRetry = (error) => {
  if (error instanceof ApiError) {
    return error.statusCode >= 400 && error.statusCode < 500;
  }

  const nonRetryableErrors = [
    "ValidationError",
    "CastError",
    "JsonWebTokenError",
    "TokenExpiredError",
  ];

  return (
    nonRetryableErrors.includes(error.name) ||
    error.code === 11000 || // MongoDB duplicate key
    error.statusCode === 429
  ); // Rate limiting
};

/**
 * Enhanced error standardization with security considerations
 */
const standardizeError = (err) => {
  if (err instanceof ApiError) return err;

  let statusCode = 500;
  let message = "An unexpected error occurred";
  let errors = [];
  const success = false;

  // Enhanced Mongoose/MongoDB error handling
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    if (err.errors) {
      errors = Object.keys(err.errors).map((field) => ({
        field,
        message: err.errors[field].message,
        value: sanitizeErrorValue(err.errors[field].value),
        kind: err.errors[field].kind,
      }));
      message = `Validation failed: ${errors.map((e) => e.message).join(", ")}`;
    }
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${sanitizeErrorValue(err.value)}`;
    errors = [
      {
        field: err.path,
        message: `Expected ${err.kind}, got ${typeof err.value}`,
        value: sanitizeErrorValue(err.value),
      },
    ];
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    message = `Duplicate value for ${field}`;
    errors = [
      {
        field,
        message: `${field} already exists`,
        value: sanitizeErrorValue(value),
      },
    ];
  } else if (err.name === "MongooseError" || err.name === "MongoError") {
    statusCode = 500;
    message = "Database operation failed";
    errors = [{ message: "Database temporarily unavailable" }];
  }
  // Enhanced JWT error handling
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
    errors = [{ message: "Token verification failed" }];
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
    errors = [{ message: "Please log in again", expiredAt: err.expiredAt }];
  } else if (err.name === "NotBeforeError") {
    statusCode = 401;
    message = "Token not active yet";
    errors = [{ message: "Token cannot be used before its activation time" }];
  }
  // Enhanced file upload error handling
  else if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 413;
    message = "File too large";
    errors = [
      {
        message: `Maximum file size is ${Math.round(err.limit / (1024 * 1024))}MB`,
        limit: err.limit,
        received: err.received,
      },
    ];
  } else if (err.code === "LIMIT_FILE_COUNT") {
    statusCode = 400;
    message = "Too many files";
    errors = [
      {
        message: `Maximum ${err.limit} files allowed`,
        limit: err.limit,
      },
    ];
  } else if (err.code === "LIMIT_FIELD_COUNT") {
    statusCode = 400;
    message = "Too many fields";
    errors = [{ message: "Form has too many fields" }];
  } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    statusCode = 400;
    message = "Unexpected file upload";
    errors = [
      {
        message: `Field "${err.field}" was not expected`,
        field: err.field,
      },
    ];
  }
  // Enhanced network error handling
  else if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    statusCode = 503;
    message = "Service temporarily unavailable";
    errors = [{ message: "External service connection failed" }];
  } else if (err.code === "ECONNRESET") {
    statusCode = 502;
    message = "Connection reset by peer";
    errors = [{ message: "Network connection was interrupted" }];
  } else if (err.code === "EHOSTUNREACH") {
    statusCode = 503;
    message = "Host unreachable";
    errors = [{ message: "Cannot reach the destination server" }];
  }
  // Enhanced timeout handling
  else if (
    err.code === "ETIMEDOUT" ||
    err.code === "ESOCKETTIMEDOUT" ||
    err.message?.includes("timeout")
  ) {
    statusCode = 504;
    message = "Operation timed out";
    errors = [{ message: "Request took too long to complete" }];
  }
  // Rate limiting
  else if (err.statusCode === 429 || err.code === "RATE_LIMIT_EXCEEDED") {
    statusCode = 429;
    message = "Rate limit exceeded";
    errors = [
      {
        message: "Too many requests, please try again later",
        retryAfter: err.retryAfter || 60,
      },
    ];
  }
  // Common JavaScript errors
  else if (err instanceof SyntaxError) {
    statusCode = err.status === 400 ? 400 : 500;
    message = err.status === 400 ? "Invalid request format" : "Server configuration error";
    errors = [
      {
        message: err.status === 400 ? "Invalid JSON in request body" : "Internal syntax error",
      },
    ];
  } else if (err instanceof TypeError) {
    statusCode = 500;
    message = "Server encountered an error";
    errors = [
      {
        message: process.env.NODE_ENV === "development" ? err.message : "Type error occurred",
      },
    ];
  } else if (err instanceof RangeError) {
    statusCode = 400;
    message = "Invalid range";
    errors = [{ message: "Value is out of acceptable range" }];
  } else if (err instanceof ReferenceError) {
    statusCode = 500;
    message = "Server configuration error";
    errors = [{ message: "Reference error occurred" }];
  }

  return new ApiError(
    statusCode,
    message,
    errors,
    process.env.NODE_ENV === "production" ? null : err.stack,
    success
  );
};

/**
 * Enhanced error handling for Express with security and monitoring
 */
const handleError = (err, { req, res, next }) => {
  const requestInfo = req
    ? {
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get?.("user-agent") || req.headers?.["user-agent"] || "unknown",
        userId: req.user?._id || req.user?.id || "unauthenticated",
        correlationId: req.correlationId || "no-correlation-id",
        query: sanitizeQuery(req.query),
        params: sanitizeParams(req.params),
        body: sanitizeBody(req.body),
      }
    : { context: "Non-request context" };

  const standardizedError = standardizeError(err);

  // Enhanced logging based on error severity
  if (standardizedError.statusCode >= 500) {
    logServerError(standardizedError, requestInfo, "ERROR");
  } else if (standardizedError.statusCode >= 400) {
    logClientError(standardizedError, requestInfo);
  }

  // Security headers for error responses
  if (res && typeof res.set === "function") {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    });
  }

  // Pass to next error handler if available
  if (typeof next === "function") {
    return next(standardizedError);
  }

  // Send error response
  if (res && typeof res.status === "function" && !res.headersSent) {
    const errorResponse = {
      success: false,
      message: standardizedError.message,
      errors: standardizedError.errors,
      statusCode: standardizedError.statusCode,
      correlationId: req?.correlationId,
      timestamp: new Date().toISOString(),
    };

    // Add stack trace in development
    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = standardizedError.stack;
    }

    return res.status(standardizedError.statusCode).json(errorResponse);
  }

  // Fallback logging
  console.error("Unhandled error occurred without valid Express response:", {
    error: standardizedError,
    requestInfo,
  });
};

/**
 * Enhanced server error logging with structured data
 */
const logServerError = (err, contextInfo, level = "ERROR") => {
  const errorLog = {
    level,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    context: contextInfo,
    errorName: err.name,
    errorCode: err.code,
    statusCode: err.statusCode || 500,
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  };

  // In production, you'd send this to your logging service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to external logging service
    // await logToExternalService(errorLog);
  }

  console.error(`[${level}] Server Error:`, JSON.stringify(errorLog, null, 2));
};

/**
 * Client error logging (4xx errors)
 */
const logClientError = (err, contextInfo) => {
  if (CONFIG.ENABLE_DETAILED_LOGGING) {
    console.warn(`[CLIENT_ERROR] ${err.statusCode}: ${err.message}`, {
      path: contextInfo.path,
      method: contextInfo.method,
      ip: contextInfo.ip,
      userAgent: contextInfo.userAgent,
      correlationId: contextInfo.correlationId,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Performance monitoring
 */
const monitorPerformance = (handlerName, duration, req, error = null) => {
  const performanceData = {
    handlerName,
    duration: Math.round(duration),
    timestamp: new Date().toISOString(),
    slow: duration > CONFIG.SLOW_QUERY_THRESHOLD,
    error: !!error,
    method: req?.method,
    path: req?.path,
    correlationId: req?.correlationId,
  };

  if (duration > CONFIG.SLOW_QUERY_THRESHOLD) {
    console.warn(`[SLOW_OPERATION] ${handlerName} took ${Math.round(duration)}ms`, performanceData);
  }

  if (CONFIG.ENABLE_DETAILED_LOGGING) {
    console.log(`[PERFORMANCE] ${handlerName}: ${Math.round(duration)}ms`, performanceData);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to monitoring service
    // await sendToMonitoringService(performanceData);
  }
};

/**
 * Circuit breaker implementation
 */
const isCircuitBreakerOpen = (handlerName) => {
  const state = circuitBreakerState.get(handlerName);
  if (!state) return false;

  if (state.state === "open") {
    if (Date.now() - state.lastFailureTime > CONFIG.CIRCUIT_BREAKER_TIMEOUT) {
      // Move to half-open state
      circuitBreakerState.set(handlerName, {
        ...state,
        state: "half-open",
        failures: 0,
      });
      return false;
    }
    return true;
  }

  return false;
};

const recordCircuitBreakerSuccess = (handlerName) => {
  const state = circuitBreakerState.get(handlerName);
  if (state?.state === "half-open") {
    // Reset to closed state
    circuitBreakerState.set(handlerName, {
      state: "closed",
      failures: 0,
      lastFailureTime: null,
    });
  }
};

const recordCircuitBreakerFailure = (handlerName) => {
  const state = circuitBreakerState.get(handlerName) || {
    state: "closed",
    failures: 0,
    lastFailureTime: null,
  };

  state.failures++;
  state.lastFailureTime = Date.now();

  if (state.failures >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
    state.state = "open";
    console.warn(`[CIRCUIT_BREAKER] Opened for ${handlerName} after ${state.failures} failures`);
  }

  circuitBreakerState.set(handlerName, state);
};

/**
 * Security-focused data sanitization
 */
const sanitizeErrorValue = (value) => {
  if (value === undefined || value === null) return "null";
  const strValue = String(value);

  // Enhanced PII detection patterns
  const sensitivePatterns = [
    /password|pwd|secret|token|key|auth|credential|private|confidential/i,
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // Email
    /^\+?[\d\s()-]{7,}$/, // Phone
    /^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/, // Credit card
    /^\d{3}-\d{2}-\d{4}$/, // SSN
    /^(?:\d{4}[-\s]?){3}\d{4}$/, // Credit card with spaces/dashes
    /^[A-Za-z0-9+/]{20,}={0,2}$/, // Base64 encoded data
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, // UUID
  ];

  if (sensitivePatterns.some((pattern) => pattern.test(strValue))) {
    return `[REDACTED_${typeof value}]`;
  }

  // Truncate very long values
  if (strValue.length > 100) {
    return strValue.substring(0, 97) + "...";
  }

  return strValue;
};

const sanitizeQuery = (query) => {
  if (!query || typeof query !== "object") return query;
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    sanitized[key] = sanitizeErrorValue(value);
  }
  return sanitized;
};

const sanitizeParams = (params) => {
  if (!params || typeof params !== "object") return params;
  const sanitized = {};
  for (const [key, value] of Object.entries(params)) {
    sanitized[key] = sanitizeErrorValue(value);
  }
  return sanitized;
};

const sanitizeBody = (body) => {
  if (!body || typeof body !== "object") return "[BODY_REDACTED]";
  const sanitized = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "object" && value !== null) {
      sanitized[key] = "[OBJECT_REDACTED]";
    } else {
      sanitized[key] = sanitizeErrorValue(value);
    }
  }
  return sanitized;
};

const sanitizeArguments = (args) => {
  return args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      return "[OBJECT_REDACTED]";
    }
    return sanitizeErrorValue(arg);
  });
};

/**
 * Generate correlation ID for request tracking
 */
const generateCorrelationId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = () => {
  console.log("Cleaning up async handler resources...");
  circuitBreakerState.clear();
  // Clear any other resources, timers, etc.
};

// Register shutdown handlers
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export { asyncHandler, CONFIG as asyncHandlerConfig, gracefulShutdown as cleanupAsyncHandler };
