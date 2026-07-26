import jwt from "jsonwebtoken";
import { environment } from "../config/environment.js";
import { AppError } from "../errors/app-error.js";

export function authenticate(request, _response, next) {
  const token = request.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token)
    return next(
      new AppError(
        401,
        "AUTHENTICATION_REQUIRED",
        "Authentication is required.",
      ),
    );
  try {
    request.auth = jwt.verify(token, environment.JWT_ACCESS_SECRET);
    return next();
  } catch {
    return next(
      new AppError(
        401,
        "INVALID_ACCESS_TOKEN",
        "Your access token is invalid or expired.",
      ),
    );
  }
}
