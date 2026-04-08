import multer from "multer"
import ApiError from "../utils/api-error.js"

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"application/pdf",
	"text/plain",
	"text/markdown",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Configure multer with memory storage, file size limits, and MIME type validation
const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
	// Validate MIME type
	if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		return cb(
			new ApiError(
				400,
				`File type "${file.mimetype}" is not allowed. Allowed: images, PDF, TXT, MD, DOC, DOCX`,
			),
		)
	}
	cb(null, true)
}

const upload = multer({
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 1, // Max 1 file per request
	},
	storage,
})

export { upload }
