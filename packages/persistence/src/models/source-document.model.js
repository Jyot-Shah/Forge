import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    originalFilename: { type: String, required: true, maxlength: 255 },
    storageKey: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    byteSize: { type: Number, required: true },
    contentHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed", "deleted"],
      default: "pending",
      index: true,
    },
    latestVersionId: mongoose.Schema.Types.ObjectId,
    error: { type: String, maxlength: 500 },
    deletedAt: Date,
  },
  { timestamps: true, versionKey: false },
);
schema.index({ projectId: 1, createdAt: -1 });
export const SourceDocument = mongoose.model("SourceDocument", schema);
