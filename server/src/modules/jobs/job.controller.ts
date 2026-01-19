import { Response } from 'express';
import * as jobService from './job.service';
import * as taskService from '../tasks/task.service';
import { AuthRequest, UserRole } from '../../types/index';
import { successResponse, errorResponse, createdResponse } from '../../utils/response';
import { getTenantId } from '../../middlewares/tenant.middleware';
import { emitToTenant, emitToJob } from '../../config/socket';

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { statusId, workerId, customerId, search, archived } = req.query;

        const jobs = await jobService.getJobs(tenantId, {
            statusId: statusId as string,
            workerId: workerId as string,
            customerId: customerId as string,
            search: search as string,
            archived: archived === 'true',
        });

        successResponse(res, jobs);
    } catch (error) {
        console.error('Get jobs error:', error);
        errorResponse(res, 'Failed to fetch jobs', 500);
    }
};

export const getJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const job = await jobService.getJobById(tenantId, req.params.id);

        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only view their assigned jobs
        if (req.user?.role === UserRole.WORKER && job.assigned_worker_id !== req.user.userId) {
            errorResponse(res, 'Access denied', 403);
            return;
        }

        // Get tasks for the job
        const tasks = await taskService.getTasksByJobId(job.id);

        successResponse(res, { ...job, tasks });
    } catch (error) {
        console.error('Get job error:', error);
        errorResponse(res, 'Failed to fetch job', 500);
    }
};

export const getJobByToken = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const job = await jobService.getJobByAccessToken(token);

        if (!job) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Get tasks (read-only for customer)
        const tasks = await taskService.getTasksByJobId(job.id);

        // Remove sensitive data for customer view
        const { customer_access_token, ...safeJob } = job;

        successResponse(res, { ...safeJob, tasks });
    } catch (error) {
        console.error('Get job by token error:', error);
        errorResponse(res, 'Failed to fetch job', 500);
    }
};

export const getWorkerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const workerId = req.user!.userId;

        const jobs = await jobService.getWorkerJobs(tenantId, workerId);
        successResponse(res, jobs);
    } catch (error) {
        console.error('Get worker jobs error:', error);
        errorResponse(res, 'Failed to fetch assigned jobs', 500);
    }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const { customerId, assignedWorkerId, statusId, title, description, scheduledDate } = req.body;

        if (!customerId || !statusId || !title) {
            errorResponse(res, 'customerId, statusId, and title are required', 400);
            return;
        }

        const job = await jobService.createJob({
            tenantId,
            customerId,
            assignedWorkerId,
            statusId,
            title,
            description,
            scheduledDate,
        });

        const jobWithDetails = await jobService.getJobById(tenantId, job.id);

        // Emit socket event for new job
        emitToTenant(tenantId, 'job:created', jobWithDetails);

        createdResponse(res, jobWithDetails, 'Job created successfully');
    } catch (error) {
        console.error('Create job error:', error);
        errorResponse(res, 'Failed to create job', 500);
    }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const jobId = req.params.id;

        // Check if job exists and user has access
        const existingJob = await jobService.getJobById(tenantId, jobId);
        if (!existingJob) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        // Workers can only update status of their assigned jobs
        if (req.user?.role === UserRole.WORKER) {
            if (existingJob.assigned_worker_id !== req.user.userId) {
                errorResponse(res, 'Access denied', 403);
                return;
            }
            // Workers can only update status
            const { statusId } = req.body;
            if (Object.keys(req.body).some(key => key !== 'statusId')) {
                errorResponse(res, 'Workers can only update job status', 403);
                return;
            }
            await jobService.updateJob(tenantId, jobId, { statusId });
        } else {
            await jobService.updateJob(tenantId, jobId, req.body);
        }

        const updatedJob = await jobService.getJobById(tenantId, jobId);

        // Emit socket events for job update
        emitToTenant(tenantId, 'job:updated', updatedJob);
        emitToJob(jobId, 'job:updated', updatedJob);

        successResponse(res, updatedJob, 'Job updated successfully');
    } catch (error) {
        console.error('Update job error:', error);
        errorResponse(res, 'Failed to update job', 500);
    }
};

export const archiveJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const archived = await jobService.archiveJob(tenantId, req.params.id, true);

        if (!archived) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        successResponse(res, null, 'Job archived successfully');
    } catch (error) {
        console.error('Archive job error:', error);
        errorResponse(res, 'Failed to archive job', 500);
    }
};

export const unarchiveJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const unarchived = await jobService.archiveJob(tenantId, req.params.id, false);

        if (!unarchived) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        successResponse(res, null, 'Job unarchived successfully');
    } catch (error) {
        console.error('Unarchive job error:', error);
        errorResponse(res, 'Failed to unarchive job', 500);
    }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tenantId = getTenantId(req);
        const deleted = await jobService.deleteJob(tenantId, req.params.id);

        if (!deleted) {
            errorResponse(res, 'Job not found', 404);
            return;
        }

        successResponse(res, null, 'Job deleted successfully');
    } catch (error) {
        console.error('Delete job error:', error);
        errorResponse(res, 'Failed to delete job', 500);
    }
};
