import mongoose, { Schema } from "mongoose"
import ms from "ms"

const refreshTokenSchema = new Schema({
	deviceInfo: {
		required: true,
		type: String,
	},
	expiresAt: {
		default: () => new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY || "7d")),
		required: true,
		type: Date,
	},
	ipAddress: {
		default: "unknown",
		required: true,
		type: String,
	},
	issuedAt: {
		default: Date.now,
		required: true,
		type: Date,
	},
	lastUsedAt: {
		default: Date.now,
		required: true,
		type: Date,
	},
	// In refreshTokenSchema
	status: {
		default: "active",
		enum: ["active", "revoked"],
		type: String,
	},
	token: {
		required: true,
		type: String,
		unique: true,
	},
	user: {
		ref: "User",
		required: true,
		type: mongoose.Schema.Types.ObjectId,
	},
})

// TTL Index managed via expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Index for finding refresh tokens by user (used in token refresh and logout)
refreshTokenSchema.index({ user: 1 })

// Index for finding active sessions by user with status
refreshTokenSchema.index({ status: 1, user: 1 })

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)
export default RefreshToken
