import { query } from '../../config/db';
import { Job, JobWithDetails } from '../../types/index';
import { v4 as uuidv4 } from 'uuid';

interface CreateJobData {
    tenantId: string;
    customerId: string;
    assignedWorkerId?: string;
    statusId: string;
    title: string;
    description?: string;
    scheduledDate?: string;
}

interface UpdateJobData {
    customerId?: string;
    assignedWorkerId?: string | null;
    statusId?: string;
    title?: string;
    description?: string;
    scheduledDate?: string | null;
}

interface JobFilters {
    statusId?: string;
    workerId?: string;
    customerId?: string;
    search?: string;
    archived?: boolean;
}

export const getJobs = async (tenantId: string, filters: JobFilters = {}): Promise<JobWithDetails[]> => {
    let sql = `
    SELECT j.id, j.tenant_id, j.customer_id, j.assigned_worker_id, j.status_id,
           j.title, j.description, j.scheduled_date, j.is_archived, j.customer_access_token,
           j.created_at, j.updated_at,
           c.name as customer_name,
           u.name as worker_name,
           s.name as status_name,
           s.color as status_color
    FROM jobs j
    LEFT JOIN customers c ON j.customer_id = c.id
    LEFT JOIN users u ON j.assigned_worker_id = u.id
    LEFT JOIN job_statuses s ON j.status_id = s.id
    WHERE j.tenant_id = $1 AND j.is_deleted = false`;

    const params: unknown[] = [tenantId];
    let paramIndex = 2;

    if (filters.statusId) {
        sql += ` AND j.status_id = $${paramIndex++}`;
        params.push(filters.statusId);
    }
    if (filters.workerId) {
        sql += ` AND j.assigned_worker_id = $${paramIndex++}`;
        params.push(filters.workerId);
    }
    if (filters.customerId) {
        sql += ` AND j.customer_id = $${paramIndex++}`;
        params.push(filters.customerId);
    }
    if (filters.search) {
        sql += ` AND (j.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
    }
    if (filters.archived !== undefined) {
        sql += ` AND j.is_archived = $${paramIndex++}`;
        params.push(filters.archived);
    } else {
        sql += ` AND j.is_archived = false`;
    }

    sql += ' ORDER BY j.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
};

export const getJobById = async (tenantId: string, jobId: string): Promise<JobWithDetails | null> => {
    const result = await query(
        `SELECT j.id, j.tenant_id, j.customer_id, j.assigned_worker_id, j.status_id,
            j.title, j.description, j.scheduled_date, j.is_archived, j.customer_access_token,
            j.created_at, j.updated_at,
            c.name as customer_name,
            u.name as worker_name,
            s.name as status_name,
            s.color as status_color
     FROM jobs j
     LEFT JOIN customers c ON j.customer_id = c.id
     LEFT JOIN users u ON j.assigned_worker_id = u.id
     LEFT JOIN job_statuses s ON j.status_id = s.id
     WHERE j.id = $1 AND j.tenant_id = $2 AND j.is_deleted = false`,
        [jobId, tenantId]
    );
    return result.rows[0] || null;
};

export const getJobByAccessToken = async (token: string): Promise<JobWithDetails | null> => {
    const result = await query(
        `SELECT j.id, j.tenant_id, j.customer_id, j.assigned_worker_id, j.status_id,
            j.title, j.description, j.scheduled_date, j.is_archived, j.customer_access_token,
            j.created_at, j.updated_at,
            c.name as customer_name,
            u.name as worker_name,
            s.name as status_name,
            s.color as status_color
     FROM jobs j
     LEFT JOIN customers c ON j.customer_id = c.id
     LEFT JOIN users u ON j.assigned_worker_id = u.id
     LEFT JOIN job_statuses s ON j.status_id = s.id
     WHERE j.customer_access_token = $1 AND j.is_deleted = false`,
        [token]
    );
    return result.rows[0] || null;
};

export const getWorkerJobs = async (tenantId: string, workerId: string): Promise<JobWithDetails[]> => {
    const result = await query(
        `SELECT j.id, j.tenant_id, j.customer_id, j.assigned_worker_id, j.status_id,
            j.title, j.description, j.scheduled_date, j.is_archived, j.customer_access_token,
            j.created_at, j.updated_at,
            c.name as customer_name,
            u.name as worker_name,
            s.name as status_name,
            s.color as status_color
     FROM jobs j
     LEFT JOIN customers c ON j.customer_id = c.id
     LEFT JOIN users u ON j.assigned_worker_id = u.id
     LEFT JOIN job_statuses s ON j.status_id = s.id
     WHERE j.tenant_id = $1 AND j.assigned_worker_id = $2 
           AND j.is_deleted = false AND j.is_archived = false
     ORDER BY j.scheduled_date ASC NULLS LAST, j.created_at DESC`,
        [tenantId, workerId]
    );
    return result.rows;
};

export const createJob = async (data: CreateJobData): Promise<Job> => {
    const result = await query(
        `INSERT INTO jobs (tenant_id, customer_id, assigned_worker_id, status_id, title, description, scheduled_date, customer_access_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
        [
            data.tenantId,
            data.customerId,
            data.assignedWorkerId || null,
            data.statusId,
            data.title,
            data.description || null,
            data.scheduledDate || null,
            uuidv4(),
        ]
    );
    return result.rows[0];
};

export const updateJob = async (
    tenantId: string,
    jobId: string,
    data: UpdateJobData
): Promise<Job | null> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.customerId !== undefined) {
        updates.push(`customer_id = $${paramIndex++}`);
        values.push(data.customerId);
    }
    if (data.assignedWorkerId !== undefined) {
        updates.push(`assigned_worker_id = $${paramIndex++}`);
        values.push(data.assignedWorkerId);
    }
    if (data.statusId !== undefined) {
        updates.push(`status_id = $${paramIndex++}`);
        values.push(data.statusId);
    }
    if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
    }
    if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
    }
    if (data.scheduledDate !== undefined) {
        updates.push(`scheduled_date = $${paramIndex++}`);
        values.push(data.scheduledDate);
    }

    if (updates.length === 0) {
        const existing = await getJobById(tenantId, jobId);
        return existing;
    }

    values.push(jobId, tenantId);

    const result = await query(
        `UPDATE jobs SET ${updates.join(', ')} 
     WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} AND is_deleted = false
     RETURNING *`,
        values
    );

    return result.rows[0] || null;
};

export const archiveJob = async (tenantId: string, jobId: string, archive = true): Promise<boolean> => {
    const result = await query(
        `UPDATE jobs SET is_archived = $1 
     WHERE id = $2 AND tenant_id = $3 AND is_deleted = false`,
        [archive, jobId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const deleteJob = async (tenantId: string, jobId: string): Promise<boolean> => {
    const result = await query(
        `UPDATE jobs SET is_deleted = true 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [jobId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
};
