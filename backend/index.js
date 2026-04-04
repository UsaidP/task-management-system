import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./src/db/dbConnect.js"

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (one level up from backend/)
dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Validate required environment variables
const requiredEnvVars = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  BLACKLISTED_TOKEN_EXPIRY: process.env.BLACKLISTED_TOKEN_EXPIRY,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  HASH_PEPPER: process.env.HASH_PEPPER,
  MONGODB_URI: process.env.MONGODB_URI,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`)
  console.error(`   Fix: Create a .env file at the project root (/Volumes/E/Projects/task-management-system/.env)`)
  process.exit(1)
}

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000

  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0")
    })
    .catch((err) => {
      console.error("MongoDB connection failed!!! ", err)
    })
}
