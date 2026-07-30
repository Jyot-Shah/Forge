import { Router } from "express";
import { authorizeProject } from "../middlewares/authorize-project.js";
import { listActivities } from "../services/activity.service.js";

const router = Router({ mergeParams: true });

router.use(authorizeProject);

router.get("/", async (req, res, next) => {
  try {
    const activities = await listActivities(req.params.projectId, {
      limit: Number(req.query.limit) || 30,
      before: req.query.before || undefined,
    });
    res.json({ activities });
  } catch (error) {
    next(error);
  }
});

export default router;
