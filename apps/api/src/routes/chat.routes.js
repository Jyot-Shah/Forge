import { Router } from "express";
import { z } from "zod";
import { authorizeProject } from "../middlewares/authorize-project.js";
import { validateBody } from "../middlewares/validate.js";
import {
  ask,
  getConversation,
  listConversations,
} from "../services/chat.service.js";
const router = Router({ mergeParams: true });
const schema = z.object({
  content: z.string().trim().min(1).max(12_000),
  conversationId: z
    .string()
    .regex(/^[a-f\d]{24}$/i)
    .nullish(),
});
router.post(
  "/",
  authorizeProject(),
  validateBody(schema),
  async (req, res, next) => {
    try {
      res.json(
        await ask(
          req.params.projectId,
          req.auth.sub,
          req.body.conversationId,
          req.body.content,
        ),
      );
    } catch (error) {
      next(error);
    }
  },
);
router.get("/", authorizeProject(), async (req, res, next) => {
  try {
    res.json({
      conversations: await listConversations(
        req.params.projectId,
        req.auth.sub,
      ),
    });
  } catch (error) {
    next(error);
  }
});
router.get("/:conversationId", authorizeProject(), async (req, res, next) => {
  try {
    res.json(
      await getConversation(
        req.params.projectId,
        req.auth.sub,
        req.params.conversationId,
      ),
    );
  } catch (error) {
    next(error);
  }
});
export default router;
