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
    default: Date.now,
    required: true,
  },
  lastUsedAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ lastUsedAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
