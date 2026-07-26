import { randomUUID } from "node:crypto";

export function requestContext(request, response, next) {
  request.requestId = request.header("x-request-id") || randomUUID();
  response.setHeader("x-request-id", request.requestId);
  next();
}
