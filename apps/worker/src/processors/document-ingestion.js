import path from "node:path";
import { createHash } from "node:crypto";
import mongoose from "mongoose";
import {
  DocumentChunk,
  DocumentVersion,
  SourceDocument,
} from "@forge/persistence/models";
import {
  ensureDocumentCollection,
  embedText,
  getQdrant,
  DOCUMENT_COLLECTION,
} from "@forge/shared/clients";

function chunkText(text, size = 2400, overlap = 300) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf("\n", end);
      if (boundary > start + size / 2) end = boundary;
    }
    const content = text.slice(start, end).trim();
    if (content) chunks.push({ content, startOffset: start, endOffset: end });
    start = Math.max(end, start + 1) - (end < text.length ? overlap : 0);
  }
  return chunks;
}

function toQdrantPointId(chunkId) {
  const hash = createHash("sha256").update(String(chunkId)).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function processDocumentIngestion({ documentId, versionId }) {
  const document = await SourceDocument.findById(documentId);
  const version = await DocumentVersion.findById(versionId);
  if (!document || !version)
    throw new Error("Document or version no longer exists.");
  document.status = "processing";
  version.ingestionStatus = "processing";
  await Promise.all([document.save(), version.save()]);
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "documents",
    });

    let rawText = "";
    const downloadStream = bucket.openDownloadStream(version.gridFsId);
    for await (const chunk of downloadStream) {
      rawText += chunk.toString("utf8");
    }

    let text = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (document.mimeType === "application/json")
      text = JSON.stringify(JSON.parse(text), null, 2);
    if (!text) throw new Error("The file does not contain indexable text.");
    const chunks = chunkText(text);
    await DocumentChunk.deleteMany({ documentVersionId: version.id });
    await DocumentChunk.insertMany(
      chunks.map((chunk, index) => ({
        projectId: document.projectId,
        documentId: document.id,
        documentVersionId: version.id,
        chunkIndex: index,
        ...chunk,
        tokenCount: Math.ceil(chunk.content.length / 4),
        contentHash: createHash("sha256").update(chunk.content).digest("hex"),
      })),
    );
    const client = getQdrant();
    await ensureDocumentCollection(client);
    const persisted = await DocumentChunk.find({
      documentVersionId: version.id,
    })
      .sort({ chunkIndex: 1 })
      .lean();
    const embeddings = [];
    for (const chunk of persisted) {
      embeddings.push(await embedText(chunk.content, "document"));
    }
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await client.upsert(DOCUMENT_COLLECTION, {
          wait: true,
          points: persisted.map((chunk, index) => ({
            id: toQdrantPointId(chunk._id),
            vector: embeddings[index],
            payload: {
              projectId: document.projectId.toString(),
              documentId: document.id,
              chunkId: chunk._id.toString(),
              status: "active",
            },
          })),
        });
        break; // Sucesss
      } catch (upsertError) {
        if (attempt === 4) {
          console.error(
            "Qdrant upsert final retry failed:",
            upsertError.message,
          );
          throw upsertError;
        }
        await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
      }
    }
    version.textLength = text.length;
    version.chunkCount = chunks.length;
    version.ingestionStatus = "ready";
    document.status = "ready";
    document.error = undefined;
    await Promise.all([version.save(), document.save()]);
  } catch (error) {
    console.error("Document ingestion failed.", {
      documentId,
      versionId,
      message: error.message,
      details: error.response?.data || error.cause?.response?.data,
    });
    version.ingestionStatus = "failed";
    version.error = error.message;
    document.status = "failed";
    document.error = error.message;
    await Promise.all([version.save(), document.save()]);
    throw error;
  }
}
