import rateLimit from "express-rate-limit"

const authLimiter = rateLimit({
	legacyHeaders: false,
	max: 5, // Limit each IP to 5 requests per window
	message: "Too many attempts from this IP, please try again after 15 minutes",
	standardHeaders: true,
	windowMs: 15 * 60 * 1000, // 15 minutes
})

export { authLimiter }
