import { validationResult } from "express-validator";
import ApiError from "../utils/api-error.js";

/**
 * Middleware to validate request using express-validator.
 * Checks for validation errors and either proceeds to the next middleware
 * or throws an ApiError with details of the validation errors.
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const validator = (req, res, next) => {
  // Get validation errors from the request
  
  const errors = validationResult(req);

  const errorMsg = errors
    .array()
    .map((err) => err.msg)
    .join(", ");

  // If no validation errors, proceed to next middleware
  if (errors.isEmpty()) {
    return next();
  }

  // Extract and format validation errors
  const extractedError = [];
  errors.array().forEach((err) => {
    extractedError.push({
      [err.path]: err.msg,
    });
  });

  // Throw an error with the extracted validation errors
  throw new ApiError(422, "Received data is not valid", extractedError);
};

export default validator;
