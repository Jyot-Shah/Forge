import { Router } from "express";
import { loginSchema, registerSchema } from "@forge/shared/schemas";
import { environment } from "../config/environment.js";
import {
  authenticate,
  createAccessToken,
  issueRefreshSession,
  register,
  rotateRefreshSession,
  revokeRefreshSession,
} from "../services/auth.service.js";
import { authenticate as requireAuthentication } from "../middlewares/authenticate.js";
import { validateBody } from "../middlewares/validate.js";

const router = Router();
const cookieOptions = (expires) => ({
  httpOnly: true,
  secure: environment.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth",
  expires,
});
const userPayload = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
});

async function respondWithSession(response, user) {
  const refresh = await issueRefreshSession(user.id);
  response.cookie(
    "forge_refresh",
    refresh.rawToken,
    cookieOptions(refresh.expiresAt),
  );
  response
    .status(200)
    .json({ accessToken: createAccessToken(user), user: userPayload(user) });
}

router.post(
  "/register",
  validateBody(registerSchema),
  async (request, response, next) => {
    try {
      await respondWithSession(response, await register(request.body));
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/login",
  validateBody(loginSchema),
  async (request, response, next) => {
    try {
      await respondWithSession(response, await authenticate(request.body));
    } catch (error) {
      next(error);
    }
  },
);
router.post("/refresh", async (request, response, next) => {
  try {
    const result = await rotateRefreshSession(request.cookies.forge_refresh);
    response.cookie(
      "forge_refresh",
      result.rawToken,
      cookieOptions(result.expiresAt),
    );
    response.json({
      accessToken: createAccessToken(result.user),
      user: userPayload(result.user),
    });
  } catch (error) {
    next(error);
  }
});
router.post("/logout", async (request, response, next) => {
  try {
    await revokeRefreshSession(request.cookies.forge_refresh);
    response.clearCookie("forge_refresh", cookieOptions());
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.get("/me", requireAuthentication, (request, response) =>
  response.json({ user: { id: request.auth.sub, email: request.auth.email } }),
);

export default router;
