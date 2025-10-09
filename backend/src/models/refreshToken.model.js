import mongoose, { Schema } from "mongoose"

const refreshTokenSchema = new Schema({
	deviceInfo: {
		required: true,
		type: String,
	},
	expiresAt: {
		default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)
export default RefreshToken
