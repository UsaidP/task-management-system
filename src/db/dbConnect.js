import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";

const connectDB = asyncHandler(async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 30000,
      retryWrites: true,
      w: "majority",
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection?.host}`, {
      tls: conn.connection?.options?.tls,
      tlsCAFile: conn.connection?.options?.tlsCAFile
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
});
export default connectDB;
