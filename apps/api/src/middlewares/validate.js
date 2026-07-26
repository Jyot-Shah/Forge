import { AppError } from "../errors/app-error.js";

export function validateBody(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success)
      return next(
        new AppError(400, "VALIDATION_ERROR", result.error.issues[0].message),
      );
    request.body = result.data;
    return next();
  };
}
