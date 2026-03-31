import mongoose from "mongoose"
// ❌ REMOVED: import { asyncHandler } from "../utils/async-handler.js"

// ✅ Changed to a standard async function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      heartbeatFrequencyMS: 30000,
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      tls: false,
      ssl: false,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection?.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB