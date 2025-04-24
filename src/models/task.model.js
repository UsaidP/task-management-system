import mongoose, { Schema } from "mongoose";
import { TaskStatusEnum, AvailableTaskStatus } from "../utils/constants";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,

      //required:[true, "Assigned by who is required!"], // we can use array for error handling.
    },
    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: String,
          mimetype: String,
          size: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
