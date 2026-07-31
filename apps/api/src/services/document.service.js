import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import {
  DocumentChunk,
  DocumentVersion,
  SourceDocument,
} from "@forge/persistence/models";
import { DOCUMENT_COLLECTION, getQdrant } from "@forge/shared/clients";
import { AppError } from "../errors/app-error.js";
import { enqueueDocumentIngestion } from "../queues/ingestion.queue.js";

function buildStorageKey(originalFilename) {
  return `${randomUUID()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

export async function createDocument(projectId, uploadedBy, file) {
  if (!file) throw new AppError(400, "FILE_REQUIRED", "A file is required.");
  try {
    const extension = path.extname(file.originalname).toLowerCase();
    const supportedExtensions = new Set([
      ".txt",
      ".md",
      ".markdown",
      ".json",
      ".py",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".html",
      ".css",
      ".yaml",
      ".yml",
      ".csv",
    ]);
    const supportedMimeTypes = new Set([
      "text/plain",
      "text/markdown",
      "text/x-markdown",
      "application/json",
      "text/json",
      "text/javascript",
      "application/javascript",
      "text/x-python",
      "text/css",
      "text/html",
      "application/octet-stream",
    ]);

    if (
      !supportedExtensions.has(extension) &&
      !supportedMimeTypes.has(file.mimetype)
    ) {
      throw new AppError(
        400,
        "UNSUPPORTED_FILE_TYPE",
        "Only text, Markdown, JSON, code, and configuration files are supported.",
      );
    }

    const storageKey = buildStorageKey(file.originalname);

    const contentHash = await new Promise((resolve, reject) => {
      const hash = createHash("sha256");
      const stream = fs.createReadStream(file.path);
      stream.on("error", reject);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
    });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "documents",
    });
    const uploadStream = bucket.openUploadStream(storageKey);
    const gridFsId = uploadStream.id;

    await new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    const document = await SourceDocument.create({
      projectId,
      uploadedBy,
      originalFilename: file.originalname,
      storageKey,
      mimeType: file.mimetype,
      byteSize: file.size,
      contentHash,
    });

    const version = await DocumentVersion.create({
      documentId: document.id,
      projectId,
      versionNumber: 1,
      contentHash,
      gridFsId,
    });

    document.latestVersionId = version.id;
    await document.save();

    await enqueueDocumentIngestion({
      documentId: document.id,
      versionId: version.id,
    });

    return document;
  } finally {
    fs.promises.unlink(file.path).catch(() => {});
  }
}

export async function listDocuments(projectId) {
  return SourceDocument.find({ projectId, deletedAt: null })
    .sort({ createdAt: -1 })
    .lean();
}

export async function getDocumentDetails(projectId, documentId) {
  const document = await SourceDocument.findOne({
    _id: documentId,
    projectId,
    deletedAt: null,
  }).lean();
  if (!document)
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  const chunks = await DocumentChunk.find({ documentId })
    .sort({ chunkIndex: 1 })
    .lean();
  return { ...document, chunks };
}

export async function reprocessDocument(projectId, documentId) {
  const document = await SourceDocument.findOne({
    _id: documentId,
    projectId,
    deletedAt: null,
  });
  if (!document)
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");

  const version = await DocumentVersion.findById(document.latestVersionId);
  if (!version)
    throw new AppError(
      404,
      "VERSION_NOT_FOUND",
      "Document version not found. The document may be corrupted.",
    );
  document.status = "pending";
  document.error = undefined;
  version.ingestionStatus = "pending";
  version.error = undefined;
  await Promise.all([document.save(), version.save()]);
  await enqueueDocumentIngestion({
    documentId: document.id,
    versionId: version.id,
  });
  return document;
}

export async function deleteDocument(projectId, documentId) {
  const document = await SourceDocument.findOne({
    _id: documentId,
    projectId,
    deletedAt: null,
  });
  if (!document)
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");

  document.status = "deleted";
  document.deletedAt = new Date();
  await document.save();
  await Promise.all([
    DocumentChunk.deleteMany({ documentId }),
    DocumentVersion.deleteMany({ documentId }),
  ]);

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await getQdrant().delete(DOCUMENT_COLLECTION, {
        wait: true,
        filter: {
          must: [{ key: "documentId", match: { value: String(document.id) } }],
        },
      });
      break;
    } catch (error) {
      if (error.status === 404) break;
      if (attempt === 4) {
        console.error(
          "Vector cleanup final retry failed; document is hidden but orphaned.",
          error.message || error,
        );
      } else {
        await new Promise((r) => setTimeout(r, 2000 * Math.pow(2, attempt)));
      }
    }
  }

  return document;
}

export async function renameDocument(projectId, documentId, newName) {
  const document = await SourceDocument.findOne({
    _id: documentId,
    projectId,
    deletedAt: null,
  });
  if (!document)
    throw new AppError(404, "DOCUMENT_NOT_FOUND", "Document not found.");
  document.originalFilename = newName;
  await document.save();
  return document;
}
