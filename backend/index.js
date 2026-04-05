import { config } from "./src/config/env.config.js"
import app from "./app.js"
import connectDB from "./src/db/dbConnect.js"

if (process.env.NODE_ENV !== "test") {
  const PORT = config.port

  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0")
    })
    .catch((err) => {
      console.error("MongoDB connection failed!!! ", err)
    })
}
