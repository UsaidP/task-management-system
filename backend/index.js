import app from "./app.js"
import { config } from "./src/config/env.config.js"
import connectDB from "./src/db/dbConnect.js"

if (process.env.NODE_ENV !== "test") {
	const PORT = config.port
	let server

	connectDB()
		.then(() => {
			server = app.listen(PORT, "0.0.0.0", () => {
				console.log(`✅ Server running on port ${PORT}`)
			})

			// Graceful shutdown handler
			const gracefulShutdown = async (signal) => {
				console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`)
				if (server) {
					server.close(async () => {
						console.log("✅ HTTP server closed")
						try {
							await import("mongoose").then((m) => m.default.connection.close())
							console.log("✅ MongoDB connection closed")
						} catch (err) {
							console.error("❌ Error during MongoDB disconnect:", err.message)
						}
						process.exit(0)
					})

					// Force exit after 10 seconds if graceful shutdown fails
					setTimeout(() => {
						console.error("⚠️ Forced shutdown after 10s timeout")
						process.exit(1)
					}, 10000)
				} else {
					process.exit(0)
				}
			}

			process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
			process.on("SIGINT", () => gracefulShutdown("SIGINT"))
		})
		.catch((err) => {
			console.error("❌ MongoDB connection failed:", err)
			process.exit(1)
		})
}
