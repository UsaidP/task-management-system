import mongoose, { Schema } from "mongoose";

const refreshTokenSchema = new Schema({
	token: {
		type: String,
		required: true,
		unique: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	deviceInfo: {
		type: String,
		required: true,
	},
	ipAddress: {
		type: String,
		required: true,
		default: "unknown",
	},
	issuedAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	lastUsedAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
	// In refreshTokenSchema
	status: {
		type: String,
		enum: ["active", "revoked"],
		default: "active",
	},
	expiresAt: {
		type: Date,
		required: true,
		default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
	},
});

// TTL Index managed via expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
