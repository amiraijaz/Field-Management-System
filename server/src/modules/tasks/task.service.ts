import { query } from '../../config/db';
import { Task } from '../../types/index';

interface CreateTaskData {
    jobId: string;
    title: string;
    description?: string;
}

interface UpdateTaskData {
    title?: string;
    description?: string;
    is_completed?: boolean;
}

export const getTasksByJobId = async (jobId: string): Promise<Task[]> => {
    const result = await query(
        `SELECT id, job_id, title, description, is_completed, completed_at, completed_by, created_at, updated_at
     FROM tasks 
     WHERE job_id = $1 AND is_deleted = false 
     ORDER BY created_at ASC`,
        [jobId]
    );
    return result.rows;
};

export const getTaskById = async (taskId: string): Promise<Task | null> => {
    const result = await query(
        `SELECT id, job_id, title, description, is_completed, completed_at, completed_by, created_at, updated_at
     FROM tasks 
     WHERE id = $1 AND is_deleted = false`,
        [taskId]
    );
    return result.rows[0] || null;
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
    const result = await query(
        `INSERT INTO tasks (job_id, title, description)
     VALUES ($1, $2, $3)
     RETURNING id, job_id, title, description, is_completed, completed_at, completed_by, created_at, updated_at`,
        [data.jobId, data.title, data.description || null]
    );
    return result.rows[0];
};

export const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task | null> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
    }
    if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
    }

    if (updates.length === 0) return getTaskById(taskId);

    values.push(taskId);

    const result = await query(
        `UPDATE tasks SET ${updates.join(', ')} 
     WHERE id = $${paramIndex} AND is_deleted = false
     RETURNING id, job_id, title, description, is_completed, completed_at, completed_by, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
};

export const completeTask = async (taskId: string, userId: string, complete = true): Promise<Task | null> => {
    const result = await query(
        `UPDATE tasks SET 
       is_completed = $1, 
       completed_at = $2,
       completed_by = $3
     WHERE id = $4 AND is_deleted = false
     RETURNING id, job_id, title, description, is_completed, completed_at, completed_by, created_at, updated_at`,
        [complete, complete ? new Date() : null, complete ? userId : null, taskId]
    );
    return result.rows[0] || null;
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
    const result = await query(
        `UPDATE tasks SET is_deleted = true WHERE id = $1 AND is_deleted = false`,
        [taskId]
    );
    return (result.rowCount ?? 0) > 0;
};

// Check if task belongs to a job in the given tenant
export const verifyTaskTenant = async (taskId: string, tenantId: string): Promise<boolean> => {
    const result = await query(
        `SELECT t.id FROM tasks t
     JOIN jobs j ON t.job_id = j.id
     WHERE t.id = $1 AND j.tenant_id = $2 AND t.is_deleted = false`,
        [taskId, tenantId]
    );
    return result.rows.length > 0;
};

// Check if task belongs to worker's assigned job
export const verifyWorkerAccess = async (taskId: string, workerId: string): Promise<boolean> => {
    const result = await query(
        `SELECT t.id FROM tasks t
     JOIN jobs j ON t.job_id = j.id
     WHERE t.id = $1 AND j.assigned_worker_id = $2 AND t.is_deleted = false`,
        [taskId, workerId]
    );
    return result.rows.length > 0;
};
