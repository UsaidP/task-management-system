import mongoose from "mongoose"
import { asyncHandler } from "../utils/async-handler.js"

const connectDB = asyncHandler(async () => {
	try {
		// Check if we are in production
		const isProduction = process.env.NODE_ENV === "production"

		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			heartbeatFrequencyMS: 30000,
			retryWrites: true,
			serverSelectionTimeoutMS: 10000,
			socketTimeoutMS: 45000,
			// Change 'true' to a dynamic check
			tls: isProduction, // Disable TLS in development for local MongoDB
			tlsAllowInvalidCertificates: false,
			w: "majority",
		})

		console.log(`✅ MongoDB Connected: ${conn.connection?.host}`)
	} catch (error) {
		console.error(`❌ MongoDB Connection Failed: ${error.message}`)
		process.exit(1)
	}
})

export default connectDB
