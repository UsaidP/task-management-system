import mongoose, { Schema } from "mongoose";

const projectNoteSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- ENHANCEMENTS ---
    title: {
      type: String,
      required: [true, "A title is required for the note."],
      trim: true,
    },
    category: {
      type: String,
      enum: ["Meeting Notes", "Resources", "Goals", "General"],
      default: "General",
    },
    isPinned: {
      type: Boolean,
      default: false, // Allows you to feature important notes.
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // Simple audit trail for who last updated the note.
    },

    // Storing as Markdown allows for rich text formatting on the frontend.
    content: {
      type: String, // Treat this string as Markdown
      required: true,
    },
  },
  { timestamps: true }
);

// Your existing index is perfect for fetching all notes for a project.
projectNoteSchema.index({ project: 1 });

// A new index to quickly find pinned notes within a project.
projectNoteSchema.index({ project: 1, isPinned: 1 });

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
