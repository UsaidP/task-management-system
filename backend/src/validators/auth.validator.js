import { body } from "express-validator"
import { AvailableUserRole } from "../utils/constants.js"

const userRegistrationValidator = () => {
	// we want to execute it directly
	// thats why we have't use any next()

	return [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Invalid Email"),

		body("username")
			.trim()
			.notEmpty()
			.withMessage("Username is required")
			.isLength({ min: 3 })
			.withMessage("Username should be minimum of 3 character")
			.isLength({ max: 13 })
			.withMessage("Username should be maximum of 13 character"),

		body("fullname")
			.trim()
			.notEmpty()
			.withMessage("Full name is required")
			.isLength({ min: 3 })
			.withMessage("Full name should be minimum of 3 character")
			.isLength({ max: 50 })
			.withMessage("Full name should be maximum of 50 character"),

		body("password")
			.notEmpty()
			.withMessage("Password is required")
			.isLength({ min: 8 })
			.withMessage("Password should be minimum of 8 characters")
			.isLength({ max: 128 })
			.withMessage("Password should be maximum of 128 characters"),
	]
}

const userLoginValidator = () => {
	return [
		body("identifier").notEmpty().withMessage("Username or email is required"),

		body("password").notEmpty().withMessage("Password is required"),
	]
}

const userForgotPasswordValidator = () => {
	return [
		body("email")
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Email is invalid"),
	]
}
const userResetPasswordValidator = () => {
	return [
		body("password")
			.notEmpty()
			.withMessage("Password is required")
			.isLength({ min: 8 })
			.withMessage("Password should be minimum of 8 characters")
			.isLength({ max: 128 })
			.withMessage("Password should be maximum of 128 characters"),
	]
}

// Provide the validators to be used in routes

const createProjectValidator = () => {
	return [body("name").notEmpty().withMessage("Name is required"), body("description").optional()]
}

const addMemberToProjectValidator = () => {
	return [
		body("email")
			.trim()
			.notEmpty()
			.withMessage("Email is required")
			.isEmail()
			.withMessage("Email is invalid"),
		body("role")
			.notEmpty()
			.withMessage("Role is required")
			.isIn(AvailableUserRole)
			.withMessage("Role is invalid"),
	]
}

export {
	userRegistrationValidator,
	userLoginValidator,
	userForgotPasswordValidator,
	userResetPasswordValidator,
	createProjectValidator,
	addMemberToProjectValidator,
}
