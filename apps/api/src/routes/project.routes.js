import { Router } from "express";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@forge/shared/schemas";
import {
  authorizeProject,
  requireProjectEditor,
} from "../middlewares/authorize-project.js";
import {
  getProject,
  createProject,
  listProjects,
  deleteProject,
  getProjectStats,
} from "../services/project.service.js";
import { validateBody } from "../middlewares/validate.js";

const router = Router();
router.get("/", async (request, response, next) => {
  try {
    response.json({ projects: await listProjects(request.auth.sub) });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/",
  validateBody(createProjectSchema),
  async (request, response, next) => {
    try {
      response
        .status(201)
        .json({ project: await createProject(request.auth.sub, request.body) });
    } catch (error) {
      next(error);
    }
  },
);
router.get(
  "/:projectId",
  authorizeProject(),
  async (request, response, next) => {
    try {
      response.json({ project: await getProject(request.params.projectId) });
    } catch (error) {
      next(error);
    }
  },
);
router.get(
  "/:projectId/stats",
  authorizeProject(),
  async (request, response, next) => {
    try {
      response.json(await getProjectStats(request.params.projectId));
    } catch (error) {
      next(error);
    }
  },
);
router.patch(
  "/:projectId",
  requireProjectEditor,
  validateBody(updateProjectSchema),
  async (request, response, next) => {
    try {
      const project = await getProject(request.params.projectId);
      Object.assign(project, request.body);
      await project.save();
      response.json({ project });
    } catch (error) {
      next(error);
    }
  },
);
router.delete(
  "/:projectId",
  requireProjectEditor,
  async (request, response, next) => {
    try {
      await deleteProject(request.params.projectId);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);
export default router;
