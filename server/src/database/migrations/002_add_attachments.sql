-- =============================================
-- Add Attachments Table
-- =============================================

CREATE TABLE job_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_attachments_job ON job_attachments(job_id) WHERE is_deleted = false;
CREATE INDEX idx_attachments_uploaded_by ON job_attachments(uploaded_by) WHERE is_deleted = false;
