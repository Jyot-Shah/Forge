import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { environment } from "./config/environment.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { authenticate } from "./middlewares/authenticate.js";
import { requestContext } from "./middlewares/request-context.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import documentRoutes from "./routes/document.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import memoryRoutes from "./routes/memory.routes.js";
import searchRoutes from "./routes/search.routes.js";
import taskRoutes from "./routes/task.routes.js";
import activityRoutes from "./routes/activity.routes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(requestContext);
  app.use(helmet());
  app.use(cors({ origin: environment.WEB_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.get("/", (_request, response) =>
    response.json({ status: "Forge Engine Active", message: "API is online." }),
  );
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/projects", authenticate, projectRoutes);
  app.use(
    "/api/v1/projects/:projectId/documents",
    authenticate,
    documentRoutes,
  );
  app.use("/api/v1/projects/:projectId/chat", authenticate, chatRoutes);
  app.use("/api/v1/projects/:projectId/memories", authenticate, memoryRoutes);
  app.use("/api/v1/projects/:projectId/search", authenticate, searchRoutes);
  app.use("/api/v1/projects/:projectId/tasks", authenticate, taskRoutes);
  app.use(
    "/api/v1/projects/:projectId/activities",
    authenticate,
    activityRoutes,
  );
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
