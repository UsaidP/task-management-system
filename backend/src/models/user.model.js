import bcrypt from "bcryptjs"
import crypto from "crypto"
import jwt from "jsonwebtoken"
import mongoose, { Schema } from "mongoose"
import ApiError from "../utils/api-error.js"
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js"
import BlacklistedToken from "./blacklistedToken.js"

const userSchema = new Schema(
	{
		avatar: {
			default: {
				url: `https://placehold.co/400`,
			},
			type: {
				localpath: String,
				url: String,
			},
		},
		email: {
			lowercase: true,
			required: true,
			trim: true,
			type: String,
			unique: true,
		},
		emailVerificationExpiry: {
			type: Date,
		},

		emailVerificationToken: {
			type: String,
		},
		forgotPasswordExpiry: {
			type: Date,
		},
		forgotPasswordToken: {
			type: String,
		},
		fullname: {
			required: true,
			type: String,
		},
		isEmailVerified: {
			default: false,
			type: Boolean,
		},
		password: {
			required: true,
			type: String,
		},
		role: {
			default: UserRoleEnum.MEMBER,
			enum: AvailableUserRole,
			required: true,
			type: String,
		},
		username: {
			lowercase: true,
			required: true,
			trim: true,
			type: String,
			unique: true,
		},
	},
	{ timestamps: true },
)

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next()
	const passwordHash = await bcrypt.hash(this.password, 10)
	this.password = passwordHash
	return next()
})

// we can create our own methods like we create prototype and polyfills
userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{
			algorithm: "HS256",
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
		},
	)
}

userSchema.methods.generateRefreshToken = async function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{
			algorithm: "HS256",
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
		},
	)
}

userSchema.methods.generateTemporaryToken = async () => {
	const unHashedToken = crypto.randomBytes(32).toString("hex")
	const pepper = process.env.HASH_PEPPER
	if (!pepper) {
		throw new Error("HASH_PEPPER environment variable not configured")
	}
	const hashToken = crypto
		.createHash("sha256")
		.update(unHashedToken + pepper)
		.digest("hex")
	const tokenExpiry = Date.now() + 20 * 60 * 1000

	return { hashToken, tokenExpiry, unHashedToken }
}

export const blacklistedToken = async (token) => {
	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
		await BlacklistedToken.create({
			expiresAt: decoded ? new Date(decoded.exp * 1000) : null,
			token: token,
			user: decoded._id,
		})

		return true
	} catch (err) {
		return new ApiError(
			401,
			"Token is not blacklisted",
			undefined,
			"",
			false,
			err,
		)
	}
}

export const User = mongoose.model("User", userSchema)
