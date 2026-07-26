import mongoose from "mongoose";
import { PROJECT_ROLE_VALUES } from "@forge/shared/constants";

const membershipSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true, enum: PROJECT_ROLE_VALUES },
  },
  { timestamps: true, versionKey: false },
);

membershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1, createdAt: -1 });

export const ProjectMembership = mongoose.model(
  "ProjectMembership",
  membershipSchema,
);
