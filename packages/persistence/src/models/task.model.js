import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["general", "bug", "feature", "refactor", "design"],
      default: "general",
    },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Task = mongoose.model("Task", schema);
