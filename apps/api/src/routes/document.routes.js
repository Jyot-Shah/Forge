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
} from "../services/document.service.js";
import { environment } from "../config/environment.js";
const router = Router({ mergeParams: true });
const uploadTmpDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../uploads/tmp",
);
const upload = multer({
  dest: uploadTmpDir,
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
      res
        .status(202)
        .json({
          document: await createDocument(
            req.params.projectId,
            req.auth.sub,
            req.file,
          ),
        });
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
      res
        .status(202)
        .json({
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
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
export default router;
