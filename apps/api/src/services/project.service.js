import { PROJECT_ROLES } from "@forge/shared/constants";
import { AppError } from "../errors/app-error.js";
import { ProjectMembership } from "../models/project-membership.model.js";
import { Project } from "../models/project.model.js";
import {
  Conversation,
  DocumentChunk,
  Memory,
  Message,
  SourceDocument,
} from "@forge/persistence/models";

export async function createProject(ownerId, input) {
  const project = await Project.create({ ...input, ownerId });
  await ProjectMembership.create({
    projectId: project.id,
    userId: ownerId,
    role: PROJECT_ROLES.OWNER,
  });
  return project;
}

export async function listProjects(userId) {
  const memberships = await ProjectMembership.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  const projectIds = memberships.map((membership) => membership.projectId);
  const projects = await Project.find({
    _id: { $in: projectIds },
    archivedAt: null,
  })
    .sort({ updatedAt: -1 })
    .lean();
  const roleByProjectId = new Map(
    memberships.map((membership) => [
      String(membership.projectId),
      membership.role,
    ]),
  );
  return projects.map((project) => ({
    ...project,
    role: roleByProjectId.get(String(project._id)),
  }));
}

export async function getProject(projectId) {
  const project = await Project.findOne({ _id: projectId, archivedAt: null });
  if (!project)
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found.");
  return project;
}

export async function deleteProject(projectId) {
  const project = await Project.findOne({ _id: projectId, archivedAt: null });
  if (!project)
    throw new AppError(404, "PROJECT_NOT_FOUND", "Project not found.");

  project.archivedAt = new Date();
  await project.save();
  return project;
}

export async function getProjectStats(projectId) {
  const [documentCount, conversationCount, memoryCount, chunkCount, byteStats] =
    await Promise.all([
      SourceDocument.countDocuments({ projectId, status: "active" }),
      Conversation.countDocuments({ projectId }),
      Memory.countDocuments({ projectId, status: "active" }),
      DocumentChunk.countDocuments({ projectId, status: "active" }),
      SourceDocument.aggregate([
        { $match: { projectId, status: "active" } },
        { $group: { _id: null, totalBytes: { $sum: "$byteSize" } } },
      ]),
    ]);

  const latestDocuments = await SourceDocument.find({
    projectId,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  const latestConversations = await Conversation.find({ projectId })
    .sort({ updatedAt: -1 })
    .limit(3)
    .lean();

  return {
    documentCount,
    conversationCount,
    memoryCount,
    chunkCount,
    totalStorageBytes: byteStats[0]?.totalBytes || 0,
    latestDocuments,
    latestConversations,
  };
}
