import { randomUUID } from "node:crypto"

/**
 * Middleware to generate a unique request ID for each request.
 * This ID is added to `req.id` and returned in the `X-Request-Id` response header.
 * Enables distributed tracing and easier debugging in logs.
 */
export const requestId = (req, res, next) => {
	const id = req.headers["x-request-id"] || randomUUID()
	req.id = id
	res.setHeader("X-Request-Id", id)
	next()
}
