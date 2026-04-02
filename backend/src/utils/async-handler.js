/**
 * @fileoverview Enterprise-grade Async Handler wrapper for Express
 * Automatically catches exceptions and passes them to the Express error handling middleware.
 */

/**
 * Wraps an asynchronous Express route or middleware handler to catch unhandled errors.
 * Ensures that any thrown errors or rejected promises are automatically
 * caught and passed to the next() Express error handler without crashing the app.
 *
 * @param {Function} requestHandler - The async Express route handler or middleware
 * @returns {Function} Express middleware function that wraps the original handler
 *
 * @example
 * export const registerUser = asyncHandler(async (req, res) => {
 *   const { email, password } = req.body;
 *   // ... handler logic
 * });
 */
const asyncHandler = (requestHandler) => {
	return (req, res, next) => {
		Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
	}
}

export { asyncHandler }
