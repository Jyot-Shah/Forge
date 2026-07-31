import fetch, { Headers, Request, Response } from "node-fetch";

if (!globalThis.originalFetchReplaced) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.originalFetchReplaced = true;
}
