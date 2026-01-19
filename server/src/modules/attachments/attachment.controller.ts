import { Response } from 'express';
import * as attachmentService from './attachment.service';
import * as jobService from '../jobs/job.service';
import { AuthRequest, UserRole } from '../../types/index';
import { successResponse, errorResponse, createdResponse } from '../../utils/response';
import { getTenantId } from '../../middlewares/tenant.middleware';
import fs from 'fs';
import path from 'path';

export const getAttachments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { jobId } = req.params;

        // Verify job exists and user has access
        const job = await jobService.getJobById(tenantId, jobId);
        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only view attachments for their assigned jobs
        if (req.user?.role === UserRole.WORKER && job.assigned_worker_id !== req.user.userId) {
            errorResponse(res, 'Access denied', 403);
            return;
        }

        const attachments = await attachmentService.getAttachmentsByJobId(jobId);
        successResponse(res, attachments);
    } catch (error) {
        console.error('Get attachments error:', error);
        errorResponse(res, 'Failed to fetch attachments', 500);
    }
};

export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { jobId } = req.params;

        // Verify job exists and user has access
        const job = await jobService.getJobById(tenantId, jobId);
        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only upload to their assigned jobs
        if (req.user?.role === UserRole.WORKER && job.assigned_worker_id !== req.user.userId) {
            errorResponse(res, 'Access denied', 403);
            return;
        }

        // Check if file was uploaded
        if (!req.file) {
            errorResponse(res, 'No file uploaded', 400);
            return;
        }

        const attachment = await attachmentService.createAttachment({
            jobId,
            uploadedBy: req.user!.userId,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
        });

        createdResponse(res, attachment, 'File uploaded successfully');
    } catch (error) {
        console.error('Upload attachment error:', error);
        errorResponse(res, 'Failed to upload file', 500);
    }
};

export const downloadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const attachment = await attachmentService.getAttachmentById(id);
        if (!attachment) {
            errorResponse(res, 'Attachment not found', 404);
            return;
        }

        // Verify job access
        const job = await jobService.getJobById(tenantId, attachment.job_id);
        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only download attachments for their assigned jobs
        if (req.user?.role === UserRole.WORKER && job.assigned_worker_id !== req.user.userId) {
            errorResponse(res, 'Access denied', 403);
            return;
        }

        // Check if file exists
        if (!fs.existsSync(attachment.file_path)) {
            errorResponse(res, 'File not found on server', 404);
            return;
        }

        res.download(attachment.file_path, attachment.file_name);
    } catch (error) {
        console.error('Download attachment error:', error);
        errorResponse(res, 'Failed to download file', 500);
    }
};

export const deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const attachment = await attachmentService.getAttachmentById(id);
        if (!attachment) {
            errorResponse(res, 'Attachment not found', 404);
            return;
        }

        // Verify job access
        const job = await jobService.getJobById(tenantId, attachment.job_id);
        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only delete their own attachments
        if (req.user?.role === UserRole.WORKER) {
            if (job.assigned_worker_id !== req.user.userId || attachment.uploaded_by !== req.user.userId) {
                errorResponse(res, 'Access denied', 403);
                return;
            }
        }

        const deleted = await attachmentService.deleteAttachment(id);
        if (!deleted) {
            errorResponse(res, 'Failed to delete attachment', 500);
            return;
        }

        // Delete physical file
        if (fs.existsSync(attachment.file_path)) {
            fs.unlinkSync(attachment.file_path);
        }

        successResponse(res, null, 'Attachment deleted successfully');
    } catch (error) {
        console.error('Delete attachment error:', error);
        errorResponse(res, 'Failed to delete attachment', 500);
    }
};
