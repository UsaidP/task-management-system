import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";
import BlacklistedToken from "./blacklistedToken.js";
import ApiError from "../utils/api-error.js";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: `https://placehold.co/400`,
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: AvailableUserRole,
      default: UserRoleEnum.MEMBER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const passwordHash = await bcrypt.hash(this.password, 10);
  this.password = passwordHash;
  return next();
});

// we can create our own methods like we create prototype and polyfills
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateTemporaryToken = async function () {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const pepper = process.env.HASH_PEPPER;
  if (!pepper) {
    throw new Error("HASH_PEPPER environment variable not configured");
  }
  const hashToken = crypto
    .createHash("sha256")
    .update(unHashedToken + pepper)
    .digest("hex");
  const tokenExpiry = Date.now() + 20 * 60 * 1000;

  return { unHashedToken, hashToken, tokenExpiry };
};

export const blacklistedToken = async function (token) {
  try {
    
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    await BlacklistedToken.create({
      token: token,
      user: decoded._id,
      expiresAt: decoded ? new Date(decoded.exp * 1000) : null,
    });

    return true;
  } catch (err) {
    return new ApiError(401, "Token is not blacklisted", undefined, "", false, err);
  }
};

export const User = mongoose.model("User", userSchema);
