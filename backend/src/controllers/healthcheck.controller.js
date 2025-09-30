import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

const healthCheck = asyncHandler(async (req, res) => {
  // Test actual database connection with ping
  const dbPing = await mongoose.connection.db.admin().ping();
  const dbStatus = dbPing.ok === 1 ? "connected" : "disconnected";

  // Convert BigInt values to numbers for JSON serialization
  const memUsage = process.memoryUsage();
  const serializedMemUsage = {
    rss: Number(memUsage.rss),
    heapTotal: Number(memUsage.heapTotal),
    heapUsed: Number(memUsage.heapUsed),
    external: Number(memUsage.external),
    arrayBuffers: Number(memUsage.arrayBuffers)
  };

  const healthStatus = {
    statusCode: dbStatus === "connected" ? 200 : 503,
    message: dbStatus === "connected" ? "Server is healthy" : "Service degraded",
    success: dbStatus === "connected"
  };

  res.status(healthStatus.statusCode).json(
    new ApiResponse(healthStatus.statusCode, {
      message: healthStatus.message,
      success: healthStatus.success,
      data: {
        pid: process.pid,
        uptime: process.uptime(),
        database: dbStatus,
        timestamp: new Date().toISOString(),
        memoryUsage: serializedMemUsage,
      },
    })
  );
});
export { healthCheck };
