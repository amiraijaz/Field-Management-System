import { Response } from 'express';
import * as jobStatusService from './jobStatus.service';
import { AuthRequest } from '../../types/index';
import { successResponse, errorResponse, createdResponse } from '../../utils/response';
import { getTenantId } from '../../middlewares/tenant.middleware';

export const getJobStatuses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const statuses = await jobStatusService.getJobStatuses(tenantId);
        successResponse(res, statuses);
    } catch (error) {
        console.error('Get job statuses error:', error);
        errorResponse(res, 'Failed to fetch job statuses', 500);
    }
};

export const getJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const status = await jobStatusService.getJobStatusById(tenantId, req.params.id);

        if (!status) {
            errorResponse(res, 'Job status not found', 404);
            return;
        }

        successResponse(res, status);
    } catch (error) {
        console.error('Get job status error:', error);
        errorResponse(res, 'Failed to fetch job status', 500);
    }
};

export const createJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { name, color } = req.body;

        if (!name) {
            errorResponse(res, 'Name is required', 400);
            return;
        }

        const status = await jobStatusService.createJobStatus({
            tenantId,
            name,
            color,
        });

        createdResponse(res, status, 'Job status created successfully');
    } catch (error) {
        console.error('Create job status error:', error);
        errorResponse(res, 'Failed to create job status', 500);
    }
};

export const updateJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const status = await jobStatusService.updateJobStatus(tenantId, req.params.id, req.body);

        if (!status) {
            errorResponse(res, 'Job status not found', 404);
            return;
        }

        successResponse(res, status, 'Job status updated successfully');
    } catch (error) {
        console.error('Update job status error:', error);
        errorResponse(res, 'Failed to update job status', 500);
    }
};

export const deleteJobStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const deleted = await jobStatusService.deleteJobStatus(tenantId, req.params.id);

        if (!deleted) {
            errorResponse(res, 'Job status not found', 404);
            return;
        }

        successResponse(res, null, 'Job status deleted successfully');
    } catch (error: any) {
        console.error('Delete job status error:', error);
        if (error.message === 'Cannot delete status that is in use') {
            errorResponse(res, error.message, 400);
            return;
        }
        errorResponse(res, 'Failed to delete job status', 500);
    }
};

export const reorderStatuses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { statusIds } = req.body;

        if (!Array.isArray(statusIds)) {
            errorResponse(res, 'statusIds array is required', 400);
            return;
        }

        await jobStatusService.reorderStatuses(tenantId, statusIds);
        successResponse(res, null, 'Statuses reordered successfully');
    } catch (error) {
        console.error('Reorder statuses error:', error);
        errorResponse(res, 'Failed to reorder statuses', 500);
    }
};
