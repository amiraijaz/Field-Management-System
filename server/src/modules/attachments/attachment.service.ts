import { query } from '../../config/db';

export interface Attachment {
    id: string;
    job_id: string;
    uploaded_by: string;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: Date;
    uploader_name?: string;
}

export const getAttachmentsByJobId = async (jobId: string): Promise<Attachment[]> => {
    const result = await query(
        `SELECT
            a.*,
            u.name as uploader_name
         FROM job_attachments a
         LEFT JOIN users u ON a.uploaded_by = u.id
         WHERE a.job_id = $1 AND a.is_deleted = false
         ORDER BY a.created_at DESC`,
        [jobId]
    );
    return result.rows;
};

export const getAttachmentById = async (id: string): Promise<Attachment | null> => {
    const result = await query(
        `SELECT
            a.*,
            u.name as uploader_name
         FROM job_attachments a
         LEFT JOIN users u ON a.uploaded_by = u.id
         WHERE a.id = $1 AND a.is_deleted = false`,
        [id]
    );
    return result.rows[0] || null;
};

export const createAttachment = async (data: {
    jobId: string;
    uploadedBy: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
}): Promise<Attachment> => {
    const result = await query(
        `INSERT INTO job_attachments (job_id, uploaded_by, file_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [data.jobId, data.uploadedBy, data.fileName, data.filePath, data.fileSize, data.mimeType]
    );
    return result.rows[0];
};

export const deleteAttachment = async (id: string): Promise<boolean> => {
    const result = await query(
        'UPDATE job_attachments SET is_deleted = true WHERE id = $1 AND is_deleted = false',
        [id]
    );
    return result.rowCount ? result.rowCount > 0 : false;
};
