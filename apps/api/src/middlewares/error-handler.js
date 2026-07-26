import { AppError } from "../errors/app-error.js";
import multer from "multer";

export function notFoundHandler(request, response) {
  response
    .status(404)
    .json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found.",
        requestId: request.requestId,
      },
    });
}

export function errorHandler(error, request, response, _next) {
  if (error instanceof multer.MulterError)
    return response
      .status(400)
      .json({
        error: {
          code: "UPLOAD_ERROR",
          message: error.message,
          requestId: request.requestId,
        },
      });
  const isOperational = error instanceof AppError;
  const status = isOperational ? error.statusCode : 500;
  const code = isOperational ? error.code : "INTERNAL_ERROR";
  if (!isOperational) console.error({ requestId: request.requestId, error });
  response
    .status(status)
    .json({
      error: {
        code,
        message: isOperational
          ? error.message
          : "An unexpected error occurred.",
        requestId: request.requestId,
      },
    });
}
