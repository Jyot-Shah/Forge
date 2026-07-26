import { GoogleGenAI } from "@google/genai";
import { environment } from "../config/environment.js";

const EMBEDDING_DIMENSIONS = 1536;
const FALLBACK_CHAT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
];

export function getGemini() {
  if (!environment.GEMINI_API_KEY) throw new Error("Gemini is not configured.");
  return new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
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

function isUnavailableModelError(error) {
  return error?.status === 404;
}

function extractTextFromCandidates(response) {
  return response.candidates
    ?.flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function embedText(text, purpose) {
  const model = environment.GEMINI_EMBEDDING_MODEL;
  const config = { outputDimensionality: EMBEDDING_DIMENSIONS };
  const contents = buildEmbeddingPrompt(text, purpose);
  const response = await getGemini().models.embedContent({
    model,
    contents,
    config,
  });
  const values = response.embeddings?.[0]?.values;
  if (!values?.length)
    throw new Error("Embedding response did not include vector values.");
  return normalizeVector(values);
}

export async function generateText(contents, systemInstruction) {
  const models = [
    ...new Set([environment.GEMINI_CHAT_MODEL, ...FALLBACK_CHAT_MODELS]),
  ];
  let lastError;

  for (const model of models) {
    try {
      const response = await getGemini().models.generateContent({
        model,
        contents,
        config: { systemInstruction },
      });
      let text =
        response.text?.trim() ||
        extractTextFromCandidates(response) ||
        "I could not generate a response from the available evidence.";
      if (text === "null") text = "I could not generate a response.";
      return { text, model };
    } catch (error) {
      lastError = error;
      if (isUnavailableModelError(error)) {
        console.warn(
          `Gemini chat model "${model}" is unavailable or not found. Retrying with a newer fallback model.`,
        );
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export { EMBEDDING_DIMENSIONS };
