import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    versionNumber: { type: Number, required: true },
    contentHash: { type: String, required: true },
    textLength: { type: Number, default: 0 },
    ingestionStatus: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    error: String,
    chunkCount: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false },
);
schema.index({ documentId: 1, versionNumber: 1 }, { unique: true });
export const DocumentVersion = mongoose.model("DocumentVersion", schema);
