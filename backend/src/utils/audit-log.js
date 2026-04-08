import { AuditLog } from "../models/auditLog.model.js"

/**
 * Logs a security/audit event to the AuditLog collection.
 * Non-blocking: failures are logged to console but do not throw.
 *
 * @param {Object} params
 * @param {Object} params.actor - The user who performed the action (Mongoose user doc or object with _id)
 * @param {string} params.category - Event category (auth, user, project, role, permission, task, sprint)
 * @param {string} params.event - Event type (e.g., "login.success", "role.change")
 * @param {string} params.description - Human-readable description
 * @param {string} [params.targetId] - The target resource ID affected
 * @param {Object} [params.metadata] - Additional metadata
 * @param {string} [params.ipAddress] - Request IP address
 * @param {string} [params.userAgent] - Request user agent
 */
export const logAudit = async ({
	actor,
	category,
	description,
	event,
	ipAddress,
	metadata = {},
	targetId,
	userAgent,
}) => {
	try {
		await AuditLog.create({
			actor: actor._id || actor,
			category,
			description,
			event,
			ipAddress,
			metadata,
			targetId: targetId?.toString(),
			userAgent,
		})
	} catch (error) {
		// Never let audit logging break the main flow
		console.error("[AuditLog] Failed to log event:", { category, error: error.message, event })
	}
}
