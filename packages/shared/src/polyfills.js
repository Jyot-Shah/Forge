import dns from "node:dns";
import fetch, { Headers, Request, Response } from "node-fetch";

dns.setDefaultResultOrder("ipv4first");

if (!globalThis.originalFetchReplaced) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
  globalThis.originalFetchReplaced = true;
}
