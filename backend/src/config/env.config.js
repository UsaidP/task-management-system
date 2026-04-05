import path from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env from project root (one level up from backend/)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

// Validate required environment variables
const requiredEnvVars = {
	ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
	BLACKLISTED_TOKEN_EXPIRY: process.env.BLACKLISTED_TOKEN_EXPIRY,
	CORS_ORIGIN: process.env.CORS_ORIGIN,
	HASH_PEPPER: process.env.HASH_PEPPER,
	MONGODB_URI: process.env.MONGODB_URI,
	REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
}

const missingVars = Object.entries(requiredEnvVars)
	.filter(([, value]) => !value)
	.map(([key]) => key)

if (missingVars.length > 0) {
	console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`)
	console.error(`   Fix: Create a .env file at the project root (/Volumes/E/Projects/task-management-system/.env)`)
	process.exit(1)
}

// Export config for use across the app
export const config = {
	port: process.env.PORT || 4000,
	nodeEnv: process.env.NODE_ENV || "development",
	mongodbUri: process.env.MONGODB_URI,
	corsOrigin: process.env.CORS_ORIGIN,
	baseUrl: process.env.BASE_URL,
	jwt: {
		secret: process.env.ACCESS_TOKEN_SECRET,
		refreshSecret: process.env.REFRESH_TOKEN_SECRET,
		accessExpiry: process.env.ACCESS_TOKEN_EXPIRY,
		refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY,
		temporaryExpiry: process.env.TEMPORARY_TOKEN_EXPIRY,
		blacklistedExpiry: process.env.BLACKLISTED_TOKEN_EXPIRY,
	},
	hashPepper: process.env.HASH_PEPPER,
	imagekit: {
		publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
		privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
		urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
		avatarFolder: process.env.IMAGEKIT_AVATAR_FOLDER || "avatars",
		projectFolder: process.env.IMAGEKIT_PROJECT_FOLDER || "TaskFlow",
	},
	email: {
		resendApiKey: process.env.RESEND_API_KEY,
		resendFrom: process.env.RESEND_FROM,
		mailHost: process.env.MAIL_HOST,
		mailPort: process.env.MAIL_PORT,
		mailUser: process.env.MAIL_USER,
		mailPass: process.env.MAIL_PASS,
		mailFrom: process.env.MAIL_FROM,
	},
}
