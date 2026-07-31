import { QdrantClient } from "@qdrant/js-client-rest";
import { environment } from "../config/environment.js";
export const DOCUMENT_COLLECTION = "forge_document_chunks";
export function getQdrant() {
  if (!environment.QDRANT_URL) throw new Error("Qdrant is not configured.");
  return new QdrantClient({
    url: environment.QDRANT_URL,
    apiKey: environment.QDRANT_API_KEY,
    checkCompatibility: false,
  });
}
export async function ensureDocumentCollection(client, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      try {
        await client.getCollection(DOCUMENT_COLLECTION);
      } catch (err) {
        if (err.status === 404) {
          await client.createCollection(DOCUMENT_COLLECTION, {
            vectors: { size: 1536, distance: "Cosine" },
          });
        } else {
          throw err;
        }
      }
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, i)));
    }
  }
}
