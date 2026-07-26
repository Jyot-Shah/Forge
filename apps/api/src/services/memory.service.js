import { Memory } from "@forge/persistence/models";
import { AppError } from "../errors/app-error.js";
export async function listMemories(projectId) {
  return Memory.find({ projectId, status: { $ne: "superseded" } })
    .sort({ updatedAt: -1 })
    .lean();
}
export async function createMemory(projectId, input) {
  return Memory.create({
    projectId,
    ...input,
    confidence: input.confidence ?? 1,
    status: input.status ?? "active",
  });
}
export async function updateMemory(projectId, memoryId, input) {
  const memory = await Memory.findOneAndUpdate(
    { _id: memoryId, projectId },
    input,
    { new: true, runValidators: true },
  );
  if (!memory) throw new AppError(404, "MEMORY_NOT_FOUND", "Memory not found.");
  return memory;
}
export async function deleteMemory(projectId, memoryId) {
  const memory = await Memory.findOneAndDelete({ _id: memoryId, projectId });
  if (!memory) throw new AppError(404, "MEMORY_NOT_FOUND", "Memory not found.");
  return memory;
}
