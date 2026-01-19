import api from './api';

export interface Attachment {
  id: string;
  job_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploader_name?: string;
}

export const attachmentsApi = {
  async getByJobId(jobId: string): Promise<Attachment[]> {
    const response = await api.get(`/attachments/job/${jobId}`);
    return response.data.data;
  },

  async upload(jobId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/attachments/job/${jobId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async download(attachmentId: string): Promise<void> {
    const response = await api.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });

    // Get filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async delete(attachmentId: string): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  },
};
