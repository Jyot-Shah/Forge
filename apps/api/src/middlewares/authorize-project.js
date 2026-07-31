import { PROJECT_ROLES } from "@forge/shared/constants";
import { AppError } from "../errors/app-error.js";
import { ProjectMembership } from "@forge/persistence/models";

export function authorizeProject(...allowedRoles) {
  return async (request, _response, next) => {
    try {
      if (!request.params.projectId) {
        return next(
          new AppError(400, "PROJECT_ID_REQUIRED", "A project id is required."),
        );
      }
      const membership = await ProjectMembership.findOne({
        projectId: request.params.projectId,
        userId: request.auth.sub,
      });
      if (
        !membership ||
        (allowedRoles.length && !allowedRoles.includes(membership.role))
      ) {
        return next(
          new AppError(
            403,
            "PROJECT_ACCESS_DENIED",
            "You do not have access to this project.",
          ),
        );
      }
      request.projectMembership = membership;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const requireProjectEditor = authorizeProject(
  PROJECT_ROLES.OWNER,
  PROJECT_ROLES.EDITOR,
);
