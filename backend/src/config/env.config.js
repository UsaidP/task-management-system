import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (two levels up from backend/src/config/)
const rootDir = path.resolve(__dirname, "../../..")
dotenv.config({ path: path.join(rootDir, ".env") })

// Helper to check for missing/whitespace-only env vars
const isPresent = (value) => value != null && value.trim() !== ""

// Validate required environment variables
const requiredEnvVars = {
	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
	BLACKLISTED_TOKEN_EXPIRY: process.env.BLACKLISTED_TOKEN_EXPIRY,
	CORS_ORIGIN: process.env.CORS_ORIGIN,
	HASH_PEPPER: process.env.HASH_PEPPER,
	MONGODB_URI: process.env.MONGODB_URI,
	REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
	TEMPORARY_TOKEN_EXPIRY: process.env.TEMPORARY_TOKEN_EXPIRY,
}

const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !isPresent(value))
	.map(([key]) => key)

if (missingVars.length > 0) {
	console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`)
	console.error(`   Fix: Create a .env file at the project root (${rootDir}/.env)`)
	process.exit(1)
}

// Warn about optional but recommended environment variables
const optionalEnvVars = [
	{ feature: "ImageKit file uploads", key: "IMAGEKIT_PUBLIC_KEY" },
	{ feature: "ImageKit file uploads", key: "IMAGEKIT_PRIVATE_KEY" },
	{ feature: "SMTP email notifications", key: "MAIL_FROM" },
	{ feature: "Resend email notifications", key: "RESEND_API_KEY" },
]

const missingOptional = optionalEnvVars.filter(({ key }) => !isPresent(process.env[key]))
if (missingOptional.length > 0) {
	const features = [...new Set(missingOptional.map(({ feature }) => feature))].join(", ")
	console.warn(
		`⚠️  Missing optional environment variables: ${missingOptional.map(({ key }) => key).join(", ")}`,
	)
	console.warn(`   Affected features: ${features}`)
}

// Export config for use across the app
export const config = {
	baseUrl: process.env.BASE_URL,
	corsOrigin: process.env.CORS_ORIGIN,
	email: {
		mailFrom: process.env.MAIL_FROM,
		mailHost: process.env.MAIL_HOST,
		mailPass: process.env.MAIL_PASS,
		mailPort: process.env.MAIL_PORT,
		mailUser: process.env.MAIL_USER,
		resendApiKey: process.env.RESEND_API_KEY,
		resendFrom: process.env.RESEND_FROM,
	},
	hashPepper: process.env.HASH_PEPPER,
	imagekit: {
		avatarFolder: process.env.IMAGEKIT_AVATAR_FOLDER || "avatars",
		privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
		projectFolder: process.env.IMAGEKIT_PROJECT_FOLDER || "TaskFlow",
		publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
		urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
	},
	jwt: {
		accessExpiry: process.env.ACCESS_TOKEN_EXPIRY,
		blacklistedExpiry: process.env.BLACKLISTED_TOKEN_EXPIRY,
		refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY,
		refreshSecret: process.env.REFRESH_TOKEN_SECRET,
		secret: process.env.ACCESS_TOKEN_SECRET,
		temporaryExpiry: process.env.TEMPORARY_TOKEN_EXPIRY,
	},
	mongodbUri: process.env.MONGODB_URI,
	nodeEnv: process.env.NODE_ENV || "development",
	port: process.env.PORT || 4000,
}
