import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["fact", "decision", "convention", "preference", "task", "summary"],
      required: true,
    },
    content: { type: String, required: true, maxlength: 2000 },
    confidence: { type: Number, min: 0, max: 1, required: true },
    status: {
      type: String,
      enum: ["candidate", "active", "rejected", "superseded"],
      default: "candidate",
    },
    sourceReferences: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);
schema.index({ content: "text" });
export const Memory = mongoose.model("Memory", schema);
