import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
export const COLLECTION = "forge_document_chunks";
export function gemini() {
  if (!process.env.GEMINI_API_KEY)
    throw new Error("GEMINI_API_KEY is required for embedding.");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
const EMBEDDING_DIMENSIONS = 1536;
export const embeddingModel =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
export function qdrant() {
  if (!process.env.QDRANT_URL)
    throw new Error("QDRANT_URL is required for indexing.");
  return new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
  });
}
export async function ensureCollection(client, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      try {
        await client.getCollection(COLLECTION);
      } catch (err) {
        if (err.status === 404) {
          await client.createCollection(COLLECTION, {
            vectors: { size: 1536, distance: "Cosine" },
          });
        } else {
          throw err;
        }
      }
      return; // Success
    } catch (networkError) {
      if (i === retries - 1) {
        console.error(
          "Qdrant ensureCollection final retry failed:",
          networkError.message,
        );
        throw networkError;
      }
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, i)));
    }
  }
}
function normalizeVector(values) {
  const magnitude = Math.hypot(...values);
  if (!magnitude) return values;
  return values.map((value) => value / magnitude);
}
export async function embedDocument(text, retries = 5) {
  const model = embeddingModel;
  const config = { outputDimensionality: EMBEDDING_DIMENSIONS };
  const contents = `Represent this project document for retrieval.\n\n${text}`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await gemini().models.embedContent({
        model,
        contents,
        config,
      });
      const values = response.embeddings?.[0]?.values;
      if (!values?.length)
        throw new Error("Embedding response did not include vector values.");
      return normalizeVector(values);
    } catch (error) {
      if (i === retries - 1) {
        console.error("Gemini Embedding final retry failed:", error.message);
        throw error;
      }
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, i)));
    }
  }
}
