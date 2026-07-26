import { Queue } from "bullmq";
import IORedis from "ioredis";
import { environment } from "../config/environment.js";
const connection = new IORedis(environment.REDIS_URL, {
  maxRetriesPerRequest: null,
});
export const ingestionQueue = new Queue("forge-ingestion", { connection });
export async function enqueueDocumentIngestion(payload) {
  return ingestionQueue.add("document.ingest", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1_000 },
    removeOnComplete: 1_000,
    removeOnFail: 5_000,
  });
}
