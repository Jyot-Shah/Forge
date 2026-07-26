import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, default: "New conversation", maxlength: 160 },
    summary: { type: String, default: "" },
    lastMessageAt: Date,
  },
  { timestamps: true, versionKey: false },
);
conversationSchema.index({ projectId: 1, lastMessageAt: -1 });
export const Conversation = mongoose.model("Conversation", conversationSchema);
