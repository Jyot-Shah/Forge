import { Router } from "express";
import { z } from "zod";
import {
  authorizeProject,
  requireProjectEditor,
} from "../middlewares/authorize-project.js";
import { validateBody } from "../middlewares/validate.js";
import {
  createMemory,
  listMemories,
  updateMemory,
  deleteMemory,
} from "../services/memory.service.js";
import { logActivity } from "../services/activity.service.js";
const router = Router({ mergeParams: true });
const createSchema = z.object({
  type: z.enum([
    "fact",
    "decision",
    "convention",
    "preference",
    "task",
    "summary",
  ]),
  category: z
    .enum([
      "fact",
      "preference",
      "decision",
      "framework",
      "coding_style",
      "deadline",
      "task",
      "goal",
    ])
    .optional(),
  content: z.string().trim().min(1).max(2000),
  confidence: z.number().min(0).max(1).optional(),
  status: z.enum(["candidate", "active", "rejected"]).optional(),
});
router.get("/", authorizeProject(), async (req, res, next) => {
  try {
    res.json({ memories: await listMemories(req.params.projectId) });
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
      const memory = await createMemory(req.params.projectId, req.body);
      logActivity(req.params.projectId, req.auth.sub, "memory_create", {
        entityType: "memory",
        entityId: memory._id,
        metadata: { type: req.body.type },
      }).catch(() => {});
      res.status(201).json({ memory });
    } catch (error) {
      next(error);
    }
  },
);
router.patch(
  "/:memoryId",
  requireProjectEditor,
  validateBody(createSchema.partial()),
  async (req, res, next) => {
    try {
      res.json({
        memory: await updateMemory(
          req.params.projectId,
          req.params.memoryId,
          req.body,
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);
router.delete("/:memoryId", requireProjectEditor, async (req, res, next) => {
  try {
    await deleteMemory(req.params.projectId, req.params.memoryId);
    logActivity(req.params.projectId, req.auth.sub, "memory_delete", {
      entityType: "memory",
      entityId: req.params.memoryId,
    }).catch(() => {});
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
export default router;
