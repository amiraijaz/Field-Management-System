import { Response } from "express";
import * as signatureService from "./signature.service";
import * as jobService from "../jobs/job.service";
import { AuthRequest, UserRole } from "../../types/index";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "../../utils/response";
import { getTenantId } from "../../middlewares/tenant.middleware";

export const getSignatures = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { jobId } = req.params;

    // Verify job exists and user has access
    const job = await jobService.getJobById(tenantId, jobId);
    if (!job) {
      errorResponse(res, "Job not found", 404);
      return;
    }

    // Workers can only view signatures for their assigned jobs
    if (
      req.user?.role === UserRole.WORKER &&
      job.assigned_worker_id !== req.user.userId
    ) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const signatures = await signatureService.getSignaturesByJobId(jobId);
    successResponse(res, signatures);
  } catch (error) {
    console.error("Get signatures error:", error);
    errorResponse(res, "Failed to fetch signatures", 500);
  }
};

export const createSignature = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tenantId = getTenantId(req);
    const { jobId } = req.params;
    const { signerType, signerName, signatureData } = req.body;

    if (!signerType || !signerName || !signatureData) {
      errorResponse(
        res,
        "signerType, signerName, and signatureData are required",
        400
      );
      return;
    }

    if (!["worker", "customer"].includes(signerType)) {
      errorResponse(
        res,
        'signerType must be either "worker" or "customer"',
        400
      );
      return;
    }

    // Verify job exists and user has access
    const job = await jobService.getJobById(tenantId, jobId);
    if (!job) {
      errorResponse(res, "Job not found", 404);
      return;
    }

    // Workers can only sign their assigned jobs
    if (
      req.user?.role === UserRole.WORKER &&
      job.assigned_worker_id !== req.user.userId
    ) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const signature = await signatureService.createSignature({
      jobId,
      signerType,
      signerId: req.user?.userId,
      signerName,
      signatureData,
    });

    createdResponse(res, signature, "Signature saved successfully");
  } catch (error) {
    console.error("Create signature error:", error);
    errorResponse(res, "Failed to save signature", 500);
  }
};

export const deleteSignature = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Only admins can delete signatures
    if (req.user?.role !== UserRole.ADMIN) {
      errorResponse(res, "Access denied", 403);
      return;
    }

    const { id } = req.params;
    const deleted = await signatureService.deleteSignature(id);

    if (!deleted) {
      errorResponse(res, "Signature not found", 404);
      return;
    }

    successResponse(res, null, "Signature deleted successfully");
  } catch (error) {
    console.error("Delete signature error:", error);
    errorResponse(res, "Failed to delete signature", 500);
  }
};
