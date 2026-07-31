import { GoogleGenAI } from "@google/genai";

const EMBEDDING_DIMENSIONS = 1536;

export function getGemini() {
  if (!process.env.GEMINI_API_KEY) throw new Error("Gemini is not configured.");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function normalizeVector(values) {
  const magnitude = Math.hypot(...values);
  if (!magnitude) return values;
  return values.map((value) => value / magnitude);
}

function buildEmbeddingPrompt(text, purpose) {
  return purpose === "document"
    ? `Represent this project document for retrieval.\n\n${text}`
    : `Represent this project search query for retrieving relevant evidence.\n\n${text}`;
}

function extractTextFromCandidates(response) {
  return response.candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function embedText(text, purpose, retries = 5) {
  const model = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
  const config = { outputDimensionality: EMBEDDING_DIMENSIONS };
  const contents = buildEmbeddingPrompt(text, purpose);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await getGemini().models.embedContent({
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

export async function generateText(
  contents,
  systemInstruction,
  aiSettings = {},
  retries = 5,
) {
  const model = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";

  const config = { systemInstruction };
  if (aiSettings.temperature !== undefined)
    config.temperature = aiSettings.temperature;
  if (aiSettings.maxTokens !== undefined)
    config.maxOutputTokens = aiSettings.maxTokens;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await getGemini().models.generateContent({
        model,
        contents,
        config,
      });

      let text =
        response.text?.trim() ||
        extractTextFromCandidates(response) ||
        "I could not generate a response from the available evidence.";

      if (text === "null") text = "I could not generate a response.";
      return { text, model };
    } catch (error) {
      if (i === retries - 1) {
        console.error("Gemini Chat final retry failed:", error.message);
        throw error;
      }
      await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, i)));
    }
  }
}

export { EMBEDDING_DIMENSIONS };
