import { Router } from "express";
import { z } from "zod";
import { authorizeProject } from "../middlewares/authorize-project.js";
import { validateBody } from "../middlewares/validate.js";
import { searchProject } from "../services/search.service.js";
import { logActivity } from "../services/activity.service.js";
const router = Router({ mergeParams: true });
router.post(
  "/",
  authorizeProject(),
  validateBody(z.object({ query: z.string().trim().min(1).max(2000) })),
  async (req, res, next) => {
    try {
      const result = await searchProject(req.params.projectId, req.body.query);
      logActivity(req.params.projectId, req.auth.sub, "search_query", {
        metadata: { query: req.body.query.slice(0, 80) },
      }).catch(() => {});
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
);
export default router;
