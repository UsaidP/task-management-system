import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./src/db/dbConnect.js"

dotenv.config({
	path: "./.env",
})

if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 4000
	connectDB()
	app.listen(PORT, "0.0.0.0", () => {
		console.log(`Server is running on PORT: ${PORT}`)
	})
}
