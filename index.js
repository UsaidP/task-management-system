import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/dbConnect.js";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT || 4000;

connectDB().then(() =>
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Server is running",
      success: true,
      data: { Health: "OK" },
    });
  })
);
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
  console.log(
    `Server is running on ${process.env.BASE_URL}:${process.env.PORT}`
  );
});
