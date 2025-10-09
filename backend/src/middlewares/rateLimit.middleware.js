import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per window
	message: "Too many attempts from this IP, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
});

export { authLimiter };
