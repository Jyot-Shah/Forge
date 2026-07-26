import { Task } from "@forge/persistence/models";
import { AppError } from "../errors/app-error.js";

export async function listTasks(projectId) {
  return Task.find({ projectId }).sort({ createdAt: -1 }).lean();
}

export async function createTask(projectId, input) {
  return Task.create({ projectId, ...input });
}

export async function updateTask(projectId, taskId, input) {
  const task = await Task.findOneAndUpdate({ _id: taskId, projectId }, input, {
    new: true,
    runValidators: true,
  });
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  return task;
}

export async function deleteTask(projectId, taskId) {
  const task = await Task.findOneAndDelete({ _id: taskId, projectId });
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task not found.");
  return task;
}
