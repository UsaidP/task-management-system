import mongoose, { Schema } from "mongoose"

const projectNoteSchema = new Schema(
	{
		category: {
			default: "General",
			enum: ["Meeting Notes", "Resources", "Goals", "General"],
			type: String,
		},

		// Storing as Markdown allows for rich text formatting on the frontend.
		content: {
			required: true,
			type: String, // Treat this string as Markdown
		},
		createdBy: {
			ref: "User",
			required: true,
			type: Schema.Types.ObjectId,
		},
		isPinned: {
			default: false, // Allows you to feature important notes.
			type: Boolean,
		},
		lastEditedBy: {
			ref: "User", // Simple audit trail for who last updated the note.
			type: Schema.Types.ObjectId,
		},
		project: {
			ref: "Project",
			required: true,
			type: Schema.Types.ObjectId,
		},

		// --- ENHANCEMENTS ---
		title: {
			required: [true, "A title is required for the note."],
			trim: true,
			type: String,
		},
	},
	{ timestamps: true },
)

// Your existing index is perfect for fetching all notes for a project.
projectNoteSchema.index({ project: 1 })

// A new index to quickly find pinned notes within a project.
projectNoteSchema.index({ isPinned: 1, project: 1 })

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema)
