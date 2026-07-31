import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  requireProjectEditor,
  authorizeProject,
} from "../middlewares/authorize-project.js";
import {
  createDocument,
  deleteDocument,
  listDocuments,
  reprocessDocument,
  getDocumentDetails,
  renameDocument,
} from "../services/document.service.js";
import { logActivity } from "../services/activity.service.js";
import { z } from "zod";
import { environment } from "../config/environment.js";
import os from "node:os";

const router = Router({ mergeParams: true });

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: environment.MAX_UPLOAD_BYTES, files: 1 },
});
router.get("/", authorizeProject(), async (req, res, next) => {
  try {
    res.json({ documents: await listDocuments(req.params.projectId) });
  } catch (error) {
    next(error);
  }
});
router.get("/:documentId", authorizeProject(), async (req, res, next) => {
  try {
    res.json({
      document: await getDocumentDetails(
        req.params.projectId,
        req.params.documentId,
      ),
    });
  } catch (error) {
    next(error);
  }
});
router.post(
  "/",
  requireProjectEditor,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const document = await createDocument(
        req.params.projectId,
        req.auth.sub,
        req.file,
      );
      logActivity(req.params.projectId, req.auth.sub, "document_upload", {
        entityType: "document",
        entityId: document._id,
        metadata: { filename: document.originalFilename },
      }).catch(() => {});
      res.status(202).json({ document });
    } catch (error) {
      next(error);
    }
  },
);
router.post(
  "/:documentId/reprocess",
  requireProjectEditor,
  async (req, res, next) => {
    try {
      res.status(202).json({
        document: await reprocessDocument(
          req.params.projectId,
          req.params.documentId,
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);
router.delete("/:documentId", requireProjectEditor, async (req, res, next) => {
  try {
    await deleteDocument(req.params.projectId, req.params.documentId);
    logActivity(req.params.projectId, req.auth.sub, "document_delete", {
      entityType: "document",
      entityId: req.params.documentId,
    }).catch(() => {});
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

const editSchema = z.object({
  originalFilename: z.string().trim().min(1),
});

router.patch("/:documentId", requireProjectEditor, async (req, res, next) => {
  try {
    const { originalFilename } = editSchema.parse(req.body);
    const document = await renameDocument(
      req.params.projectId,
      req.params.documentId,
      originalFilename,
    );
    res.json({ document });
  } catch (error) {
    next(error);
  }
});

export default router;
