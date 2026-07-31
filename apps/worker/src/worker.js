import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import { processDocumentIngestion } from "./processors/document-ingestion.js";

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../.env",
  ),
});

const redisUrl = process.env.REDIS_URL;
if (!redisUrl)
  throw new Error("REDIS_URL is required to run the Forge worker.");

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
if (!process.env.MONGODB_URI)
  throw new Error("MONGODB_URI is required to run the Forge worker.");
await mongoose.connect(process.env.MONGODB_URI);
const worker = new Worker(
  "forge-ingestion",
  async (job) => {
    if (job.name === "document.ingest")
      return processDocumentIngestion(job.data);
    throw new Error(`No processor is registered for job type: ${job.name}`);
  },
  { connection },
);

worker.on("failed", (job, error) =>
  console.error({ jobId: job?.id, jobName: job?.name, error: error.message }),
);
worker.on("ready", () => console.log("Forge worker is ready."));
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await worker.close();
    await connection.quit();
    await mongoose.disconnect();
    process.exit(0);
  });
