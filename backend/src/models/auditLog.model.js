import mongoose, { Schema } from "mongoose"

/**
 * Audit log model for tracking security-relevant events.
 * Used for compliance, incident investigation, and anomaly detection.
 *
 * Events logged:
 * - User registration/deletion
 * - Password changes/reset
 * - Role changes
 * - Login/logout failures
 * - Project creation/deletion
 * - Permission changes
 */
const auditLogSchema = new Schema(
	{
		// The user who performed the action
		actor: {
			ref: "User",
			required: true,
			type: Schema.Types.ObjectId,
		},
		// Event category (auth, user, project, role, permission)
		category: {
			enum: ["auth", "user", "project", "role", "permission", "task", "sprint"],
			required: true,
			type: String,
		},
		// Description of what happened
		description: {
			required: true,
			trim: true,
			type: String,
		},
		// Event type (e.g., "login.success", "role.change", "project.delete")
		event: {
			required: true,
			type: String,
		},
		// IP address of the request
		ipAddress: {
			type: String,
		},
		// Extra metadata about the event
		metadata: {
			default: {},
			type: Schema.Types.Mixed,
		},
		// The target resource affected (user ID, project ID, etc.)
		targetId: {
			type: String,
		},
		// User agent string
		userAgent: {
			type: String,
		},
	},
	{ timestamps: { createdAt: true, updatedAt: false } },
)

// Index for querying by user
auditLogSchema.index({ actor: 1, createdAt: -1 })

// Index for querying by event type
auditLogSchema.index({ createdAt: -1, event: 1 })

// TTL index: auto-delete logs older than 90 days to manage storage
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const AuditLog = mongoose.model("AuditLog", auditLogSchema)
export default AuditLog
