import { Router } from "express";
import { z } from "zod";
import {
  authorizeProject,
  requireProjectEditor,
} from "../middlewares/authorize-project.js";
import { validateBody } from "../middlewares/validate.js";
import {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
} from "../services/task.service.js";
import { logActivity } from "../services/activity.service.js";

const router = Router({ mergeParams: true });

const createSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["open", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z
    .enum(["general", "bug", "feature", "refactor", "design"])
    .optional(),
  dueDate: z.string().datetime().optional(),
});

router.get("/", authorizeProject(), async (req, res, next) => {
  try {
    res.json({ tasks: await listTasks(req.params.projectId) });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireProjectEditor,
  validateBody(createSchema),
  async (req, res, next) => {
    try {
      const task = await createTask(req.params.projectId, req.body);
      logActivity(req.params.projectId, req.auth.sub, "task_create", {
        entityType: "task",
        entityId: task._id,
        metadata: { title: req.body.title },
      }).catch(() => {});
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:taskId",
  requireProjectEditor,
  validateBody(createSchema.partial()),
  async (req, res, next) => {
    try {
      const task = await updateTask(
        req.params.projectId,
        req.params.taskId,
        req.body,
      );
      logActivity(req.params.projectId, req.auth.sub, "task_update", {
        entityType: "task",
        entityId: task._id,
        metadata: { status: task.status },
      }).catch(() => {});
      res.json({ task });
    } catch (error) {
      next(error);
    }
  },
);

router.delete("/:taskId", requireProjectEditor, async (req, res, next) => {
  try {
    await deleteTask(req.params.projectId, req.params.taskId);
    logActivity(req.params.projectId, req.auth.sub, "task_delete", {
      entityType: "task",
      entityId: req.params.taskId,
    }).catch(() => {});
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
