import { Activity } from "@forge/persistence";

export async function logActivity(
  projectId,
  userId,
  action,
  { entityType, entityId, metadata } = {},
) {
  return Activity.create({
    projectId,
    userId,
    action,
    entityType,
    entityId,
    metadata,
  });
}

export async function listActivities(projectId, { limit = 30, before } = {}) {
  const filter = { projectId };
  if (before) filter.createdAt = { $lt: new Date(before) };
  return Activity.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
}
