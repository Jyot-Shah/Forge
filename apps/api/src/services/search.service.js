import { DocumentChunk, Memory } from "@forge/persistence/models";
import {
  embedText,
  DOCUMENT_COLLECTION,
  ensureDocumentCollection,
  getQdrant,
} from "@forge/shared/clients";

export async function searchProject(projectId, query) {
  let lexical = [];
  let memories = [];
  try {
    [lexical, memories] = await Promise.all([
      DocumentChunk.find(
        { projectId, $text: { $search: query } },
        { score: { $meta: "textScore" } },
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(20)
        .lean(),
      Memory.find({ projectId, status: "active", $text: { $search: query } })
        .limit(10)
        .lean(),
    ]);
  } catch {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");
    [lexical, memories] = await Promise.all([
      DocumentChunk.find({ projectId, content: regex }).limit(20).lean(),
      Memory.find({ projectId, status: "active", content: regex })
        .limit(10)
        .lean(),
    ]);
  }

  const byId = new Map();

  for (const [rank, chunk] of lexical.entries()) {
    const current = byId.get(String(chunk._id)) || { ...chunk, score: 0 };
    current.score += 1 / (60 + rank + 1);
    byId.set(String(chunk._id), current);
  }

  try {
    const qdrant = getQdrant();
    await ensureDocumentCollection(qdrant);
    const vector = await embedText(query, "query");
    const semantic = await qdrant.search(DOCUMENT_COLLECTION, {
      vector,
      limit: 20,
      filter: {
        must: [{ key: "projectId", match: { value: String(projectId) } }],
      },
      with_payload: true,
    });
    const semanticIds = semantic.map((hit) => hit.payload.chunkId);
    const semanticChunks = await DocumentChunk.find({
      _id: { $in: semanticIds },
    }).lean();

    for (const [rank, chunk] of semanticChunks.entries()) {
      const current = byId.get(String(chunk._id)) || { ...chunk, score: 0 };
      current.score += 1 / (60 + rank + 1);
      byId.set(String(chunk._id), current);
    }
  } catch (error) {
    console.warn(
      "Semantic search unavailable; falling back to lexical retrieval.",
      error.message,
    );
  }

  return {
    results: [...byId.values()].sort((a, b) => b.score - a.score),
    memories,
  };
}
