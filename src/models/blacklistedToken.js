/*************  ✨ Windsurf Command 🌟  *************/
// This is a mongoose model for blacklisted tokens. Blacklisted tokens are tokens that have been
// expired or have been used to access the API, but are no longer valid. This model is used to
// store the tokens that have been blacklisted and to check if a token is blacklisted or not.
import mongoose from "mongoose";

// The model has the following fields:
// - token: the actual token that has been blacklisted. This is a string and it is required.
// - user: the user that the blacklisted token belongs to. This is a reference to the User model.
// - expiresAt: the date and time when the token will expire. This is a Date object and it is required.
const blacklistedTokenSchema = new mongoose.Schema(
  {
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
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// The model also has a timestamps field, which is a mongoose feature that adds two fields to the
// model: createdAt and updatedAt. These fields are automatically set to the current date and time
// when the document is created or updated.
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// The model also has an index on the expiresAt field. This index is used to remove blacklisted
// tokens that have expired from the database. The expireAfterSeconds option is set to 0, which
// means that the documents will be removed from the database as soon as they expire.
export const blacklistedToken = mongoose.model(
  "BlacklistedToken",
  blacklistedTokenSchema
);

// The model is exported as a default export so that it can be imported and used in other parts
// of the application.

// Why do we need this?
// We need this because we want to make sure that once a user logs out, they cannot access the
// API with the same token again. This is a security feature that prevents unauthorized access
// to the API.
export default blacklistedToken;
