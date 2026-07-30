import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "document_upload",
        "document_delete",
        "chat_message",
        "memory_create",
        "memory_delete",
        "task_create",
        "task_update",
        "task_delete",
        "search_query",
      ],
    },
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

activitySchema.index({ projectId: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
