import { Router } from "express";
import * as signatureController from "./signature.controller";
import {
  authMiddleware,
  adminOrWorker,
  tenantMiddleware,
} from "../../middlewares/index";

const router = Router();

// Protected routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Get signatures for a job
router.get("/job/:jobId", adminOrWorker, signatureController.getSignatures);

// Create signature for a job
router.post("/job/:jobId", adminOrWorker, signatureController.createSignature);

// Delete signature (admin only)
router.delete("/:id", adminOrWorker, signatureController.deleteSignature);

export default router;
