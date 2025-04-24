import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

const healthCheck = asyncHandler((req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      message: "Server is running",
      success: true,
      data: { Health: "OK" },
    })
  );
});
export { healthCheck };
