import { Router } from "express";
import { z } from "zod";
import { authorizeProject } from "../middlewares/authorize-project.js";
import { validateBody } from "../middlewares/validate.js";
import { searchProject } from "../services/search.service.js";
const router = Router({ mergeParams: true });
router.post(
  "/",
  authorizeProject(),
  validateBody(z.object({ query: z.string().trim().min(1).max(2000) })),
  async (req, res, next) => {
    try {
      res.json(await searchProject(req.params.projectId, req.body.query));
    } catch (error) {
      next(error);
    }
  },
);
export default router;
