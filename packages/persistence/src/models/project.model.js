import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    aiSettings: {
      model: { type: String, default: "gemini-2.5-flash" },
      temperature: { type: Number, default: 0.7 },
      maxTokens: { type: Number, default: 2048 },
    },
    archivedAt: Date,
  },
  { timestamps: true, versionKey: false },
);

export const Project = mongoose.model("Project", projectSchema);
