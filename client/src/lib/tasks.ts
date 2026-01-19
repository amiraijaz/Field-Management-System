import api from './api';
import { ApiResponse, Task } from '@/types';

interface CreateTaskData {
    title: string;
    description?: string;
}

export const tasksApi = {
    getByJobId: async (jobId: string): Promise<Task[]> => {
        const response = await api.get<ApiResponse<Task[]>>(`/tasks/job/${jobId}`);
        return response.data.data || [];
    },

    create: async (jobId: string, data: CreateTaskData): Promise<Task> => {
        const response = await api.post<ApiResponse<Task>>(`/tasks/job/${jobId}`, data);
        return response.data.data!;
    },

    update: async (taskId: string, data: Partial<CreateTaskData>): Promise<Task> => {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, data);
        return response.data.data!;
    },

    complete: async (taskId: string, complete = true): Promise<Task> => {
        const response = await api.post<ApiResponse<Task>>(`/tasks/${taskId}/complete`, { complete });
        return response.data.data!;
    },

    delete: async (taskId: string): Promise<void> => {
        await api.delete(`/tasks/${taskId}`);
    },
};
