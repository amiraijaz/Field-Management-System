import api from './api';
import { ApiResponse, JobStatus } from '@/types';

interface CreateStatusData {
    name: string;
    color?: string;
}

export const statusesApi = {
    getAll: async (): Promise<JobStatus[]> => {
        const response = await api.get<ApiResponse<JobStatus[]>>('/job-statuses');
        return response.data.data || [];
    },

    create: async (data: CreateStatusData): Promise<JobStatus> => {
        const response = await api.post<ApiResponse<JobStatus>>('/job-statuses', data);
        return response.data.data!;
    },

    update: async (id: string, data: Partial<CreateStatusData>): Promise<JobStatus> => {
        const response = await api.put<ApiResponse<JobStatus>>(`/job-statuses/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/job-statuses/${id}`);
    },

    reorder: async (statusIds: string[]): Promise<void> => {
        await api.post('/job-statuses/reorder', { statusIds });
    },
};
