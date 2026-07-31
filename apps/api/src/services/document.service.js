import { createHash, randomUUID } from "node:crypto";
import { writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import {
  DocumentChunk,
  DocumentVersion,
  SourceDocument,
} from "@forge/persistence/models";
import { DOCUMENT_COLLECTION, getQdrant } from "../clients/qdrant.client.js";
import os from "node:os";

const uploadRoot = os.tmpdir(); // Strictly rely on the ultimate top-level temp directory.

function buildStorageKey(originalFilename) {
  return `${randomUUID()}-${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

export async function createDocument(projectId, uploadedBy, file) {
  if (!file) throw new AppError(400, "FILE_REQUIRED", "A file is required.");
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
  const storagePath = path.join(uploadRoot, storageKey);

  await mkdir(uploadRoot, { recursive: true });

  try {
    // Write the raw buffer directly from memory into the root /tmp directory. Absolute stability.
    await writeFile(storagePath, file.buffer);

    const rawText = await readFile(storagePath, "utf8");
    const contentHash = createHash("sha256").update(rawText).digest("hex");
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
    });
    document.latestVersionId = version.id;
    await document.save();
    await enqueueDocumentIngestion({
      documentId: document.id,
      versionId: version.id,
    });
    return document;
  } catch (error) {
    await rm(storagePath, { force: true }).catch(() => {});
    throw error;
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
    rm(path.join(uploadRoot, document.storageKey), { force: true }),
  ]);

  try {
    await getQdrant().delete(DOCUMENT_COLLECTION, {
      wait: true,
      filter: {
        must: [{ key: "documentId", match: { value: String(document.id) } }],
      },
    });
  } catch (error) {
    console.error(
      "Vector cleanup failed; document is hidden and can be reconciled later.",
      error,
    );
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
