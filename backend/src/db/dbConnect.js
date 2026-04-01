import mongoose from "mongoose"

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      heartbeatFrequencyMS: 30000,
      retryWrites: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      tls: true,
      ssl: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection?.host}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

export default connectDB