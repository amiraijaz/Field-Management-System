import { query } from "../../config/db";

export interface Signature {
  id: string;
  job_id: string;
  signer_type: "worker" | "customer";
  signer_id: string | null;
  signer_name: string;
  signature_data: string;
  signed_at: Date;
}

export const getSignaturesByJobId = async (
  jobId: string
): Promise<Signature[]> => {
  const result = await query(
    `SELECT * FROM job_signatures
         WHERE job_id = $1 AND is_deleted = false
         ORDER BY signed_at DESC`,
    [jobId]
  );
  return result.rows;
};

export const createSignature = async (data: {
  jobId: string;
  signerType: "worker" | "customer";
  signerId?: string;
  signerName: string;
  signatureData: string;
}): Promise<Signature> => {
  const result = await query(
    `INSERT INTO job_signatures (job_id, signer_type, signer_id, signer_name, signature_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
    [
      data.jobId,
      data.signerType,
      data.signerId || null,
      data.signerName,
      data.signatureData,
    ]
  );
  return result.rows[0];
};

export const deleteSignature = async (id: string): Promise<boolean> => {
  const result = await query(
    "UPDATE job_signatures SET is_deleted = true WHERE id = $1 AND is_deleted = false",
    [id]
  );
  return result.rowCount ? result.rowCount > 0 : false;
};
