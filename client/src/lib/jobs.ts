import api from './api';
import { ApiResponse, Job, JobWithDetails } from '@/types';

interface JobFilters {
    statusId?: string;
    workerId?: string;
    customerId?: string;
    search?: string;
    archived?: boolean;
}

interface CreateJobData {
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

export const jobsApi = {
    getAll: async (filters?: JobFilters): Promise<JobWithDetails[]> => {
        const params = new URLSearchParams();
        if (filters?.statusId) params.append('statusId', filters.statusId);
        if (filters?.workerId) params.append('workerId', filters.workerId);
        if (filters?.customerId) params.append('customerId', filters.customerId);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.archived !== undefined) params.append('archived', String(filters.archived));

        const response = await api.get<ApiResponse<JobWithDetails[]>>(`/jobs?${params.toString()}`);
        return response.data.data || [];
    },

    getById: async (id: string): Promise<JobWithDetails> => {
        const response = await api.get<ApiResponse<JobWithDetails>>(`/jobs/${id}`);
        return response.data.data!;
    },

    getWorkerJobs: async (): Promise<JobWithDetails[]> => {
        const response = await api.get<ApiResponse<JobWithDetails[]>>('/jobs/worker/assigned');
        return response.data.data || [];
    },

    getByToken: async (token: string): Promise<JobWithDetails> => {
        const response = await api.get<ApiResponse<JobWithDetails>>(`/jobs/customer/${token}`);
        return response.data.data!;
    },

    create: async (data: CreateJobData): Promise<JobWithDetails> => {
        const response = await api.post<ApiResponse<JobWithDetails>>('/jobs', data);
        return response.data.data!;
    },

    update: async (id: string, data: UpdateJobData): Promise<JobWithDetails> => {
        const response = await api.put<ApiResponse<JobWithDetails>>(`/jobs/${id}`, data);
        return response.data.data!;
    },

    archive: async (id: string): Promise<void> => {
        await api.post(`/jobs/${id}/archive`);
    },

    unarchive: async (id: string): Promise<void> => {
        await api.post(`/jobs/${id}/unarchive`);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/jobs/${id}`);
    },
};
