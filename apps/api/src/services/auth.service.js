import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { environment } from "../config/environment.js";
import { AppError } from "../errors/app-error.js";
import { RefreshSession } from "../models/refresh-session.model.js";
import { User } from "../models/user.model.js";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export function createAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    environment.JWT_ACCESS_SECRET,
    { expiresIn: environment.JWT_ACCESS_TTL },
  );
}

export async function register(input) {
  const existing = await User.exists({ email: input.email.toLowerCase() });
  if (existing)
    throw new AppError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "An account with this email already exists.",
    );
  const passwordHash = await bcrypt.hash(input.password, 12);
  return User.create({
    email: input.email,
    displayName: input.displayName,
    passwordHash,
  });
}

export async function authenticate(input) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    "+passwordHash",
  );
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(
      401,
      "INVALID_CREDENTIALS",
      "Email or password is incorrect.",
    );
  }
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

export async function issueRefreshSession(userId) {
  const rawToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(
    Date.now() + environment.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  await RefreshSession.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
  return { rawToken, expiresAt };
}

export async function rotateRefreshSession(rawToken) {
  if (!rawToken)
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Your session has expired.",
    );
  const session = await RefreshSession.findOneAndDelete({
    tokenHash: hashToken(rawToken),
  });
  if (!session || session.expiresAt <= new Date())
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Your session has expired.",
    );
  const user = await User.findById(session.userId);
  if (!user)
    throw new AppError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Your session is invalid.",
    );
  return { user, ...(await issueRefreshSession(user.id)) };
}

export async function revokeRefreshSession(rawToken) {
  if (rawToken)
    await RefreshSession.deleteOne({ tokenHash: hashToken(rawToken) });
}
