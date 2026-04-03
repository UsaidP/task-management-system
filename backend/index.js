import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (one level up from backend/) - MUST be first!
dotenv.config({ path: path.resolve(__dirname, "../.env") })

import app from "./app.js"
import connectDB from "./src/db/dbConnect.js"

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
