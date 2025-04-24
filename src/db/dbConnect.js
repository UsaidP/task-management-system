import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";

const connectDB = asyncHandler(async function () {
  await mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("✅ MongoDB Connected");
  });
});
export default connectDB;
