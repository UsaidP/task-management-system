import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/dbConnect.js";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 4000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
