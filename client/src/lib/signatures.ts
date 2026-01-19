import api from './api';

export interface Signature {
  id: string;
  job_id: string;
  signer_type: 'worker' | 'customer';
  signer_id: string | null;
  signer_name: string;
  signature_data: string;
  signed_at: string;
}

export const signaturesApi = {
  async getByJobId(jobId: string): Promise<Signature[]> {
    const response = await api.get(`/signatures/job/${jobId}`);
    return response.data.data;
  },

  async create(jobId: string, data: {
    signerType: 'worker' | 'customer';
    signerName: string;
    signatureData: string;
  }): Promise<Signature> {
    const response = await api.post(`/signatures/job/${jobId}`, data);
    return response.data.data;
  },

  async delete(signatureId: string): Promise<void> {
    await api.delete(`/signatures/${signatureId}`);
  },
};
