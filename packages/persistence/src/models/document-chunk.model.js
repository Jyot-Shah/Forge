import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    documentVersionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    contentHash: { type: String, required: true },
    tokenCount: { type: Number, required: true },
    startOffset: Number,
    endOffset: Number,
  },
  { timestamps: true, versionKey: false },
);
schema.index({ projectId: 1, documentId: 1 });
schema.index({ documentVersionId: 1, chunkIndex: 1 }, { unique: true });
schema.index({ content: "text" });
export const DocumentChunk = mongoose.model("DocumentChunk", schema);
