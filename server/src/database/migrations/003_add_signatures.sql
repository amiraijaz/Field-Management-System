-- =============================================
-- Add Signatures Table
-- =============================================

CREATE TYPE signature_type AS ENUM ('worker', 'customer');

CREATE TABLE job_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    signer_type signature_type NOT NULL,
    signer_id UUID REFERENCES users(id),
    signer_name VARCHAR(255) NOT NULL,
    signature_data TEXT NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

CREATE INDEX idx_signatures_job ON job_signatures(job_id) WHERE is_deleted = false;
CREATE INDEX idx_signatures_signer ON job_signatures(signer_id) WHERE is_deleted = false;
