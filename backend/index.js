import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./src/db/dbConnect.js"

// Use default config. It won't crash if the file is missing
// (which is fine because Docker provides the variables anyway)
dotenv.config()

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3001

  // Optional: Debugging line to see if variables are actually loading


  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on PORT: ${PORT}`)
      })
    })
    .catch((err) => {
      console.error("MongoDB connection failed!!! ", err)
    })
}
