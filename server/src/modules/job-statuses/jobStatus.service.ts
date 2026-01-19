import { query } from '../../config/db';
import { JobStatus } from '../../types/index';

interface CreateStatusData {
    tenantId: string;
    name: string;
    color?: string;
}

interface UpdateStatusData {
    name?: string;
    color?: string;
}

export const getJobStatuses = async (tenantId: string): Promise<JobStatus[]> => {
    const result = await query(
        `SELECT id, tenant_id, name, color, order_index, created_at, updated_at
     FROM job_statuses 
     WHERE tenant_id = $1 AND is_deleted = false 
     ORDER BY order_index ASC`,
        [tenantId]
    );
    return result.rows;
};

export const getJobStatusById = async (tenantId: string, statusId: string): Promise<JobStatus | null> => {
    const result = await query(
        `SELECT id, tenant_id, name, color, order_index, created_at, updated_at
     FROM job_statuses 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [statusId, tenantId]
    );
    return result.rows[0] || null;
};

export const createJobStatus = async (data: CreateStatusData): Promise<JobStatus> => {
    // Get max order_index
    const maxResult = await query(
        `SELECT COALESCE(MAX(order_index), -1) as max_order FROM job_statuses WHERE tenant_id = $1`,
        [data.tenantId]
    );
    const nextOrder = maxResult.rows[0].max_order + 1;

    const result = await query(
        `INSERT INTO job_statuses (tenant_id, name, color, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING id, tenant_id, name, color, order_index, created_at, updated_at`,
        [data.tenantId, data.name, data.color || '#6366f1', nextOrder]
    );
    return result.rows[0];
};

export const updateJobStatus = async (
    tenantId: string,
    statusId: string,
    data: UpdateStatusData
): Promise<JobStatus | null> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }
    if (data.color !== undefined) {
        updates.push(`color = $${paramIndex++}`);
        values.push(data.color);
    }

    if (updates.length === 0) return getJobStatusById(tenantId, statusId);

    values.push(statusId, tenantId);

    const result = await query(
        `UPDATE job_statuses SET ${updates.join(', ')} 
     WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} AND is_deleted = false
     RETURNING id, tenant_id, name, color, order_index, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
};

export const deleteJobStatus = async (tenantId: string, statusId: string): Promise<boolean> => {
    // Check if status is in use
    const inUse = await query(
        `SELECT id FROM jobs WHERE status_id = $1 AND is_deleted = false LIMIT 1`,
        [statusId]
    );

    if (inUse.rows.length > 0) {
        throw new Error('Cannot delete status that is in use');
    }

    const result = await query(
        `UPDATE job_statuses SET is_deleted = true 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [statusId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const reorderStatuses = async (tenantId: string, statusIds: string[]): Promise<void> => {
    for (let i = 0; i < statusIds.length; i++) {
        await query(
            `UPDATE job_statuses SET order_index = $1 WHERE id = $2 AND tenant_id = $3`,
            [i, statusIds[i], tenantId]
        );
    }
};
