import mongoose from "mongoose"
import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

const healthCheck = asyncHandler(async (req, res) => {
	// Test actual database connection with ping
	const dbPing = await mongoose.connection.db.admin().ping()
	const dbStatus = dbPing.ok === 1 ? "connected" : "disconnected"

	// Convert BigInt values to numbers for JSON serialization
	const memUsage = process.memoryUsage()
	const serializedMemUsage = {
		arrayBuffers: Number(memUsage.arrayBuffers),
		external: Number(memUsage.external),
		heapTotal: Number(memUsage.heapTotal),
		heapUsed: Number(memUsage.heapUsed),
		rss: Number(memUsage.rss),
	}

	const healthStatus = {
		message:
			dbStatus === "connected" ? "Server is healthy" : "Service degraded",
		statusCode: dbStatus === "connected" ? 200 : 503,
		success: dbStatus === "connected",
	}

	res.status(healthStatus.statusCode).json(
		new ApiResponse(healthStatus.statusCode, {
			data: {
				database: dbStatus,
				memoryUsage: serializedMemUsage,
				pid: process.pid,
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
			},
			message: healthStatus.message,
			success: healthStatus.success,
		}),
	)
})
export { healthCheck }
