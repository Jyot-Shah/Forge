import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sequenceNumber: { type: Number, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citations: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false },
);
schema.index({ conversationId: 1, sequenceNumber: 1 }, { unique: true });
export const Message = mongoose.model("Message", schema);
