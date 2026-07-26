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
export async function ensureDocumentCollection(client) {
  try {
    await client.getCollection(DOCUMENT_COLLECTION);
  } catch {
    await client.createCollection(DOCUMENT_COLLECTION, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }
}
