import api from './api';
import { ApiResponse, User } from '@/types';

interface CreateUserData {
    email: string;
    password: string;
    name: string;
    role: 'admin' | 'worker';
}

export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users');
        return response.data.data || [];
    },

    getWorkers: async (): Promise<User[]> => {
        const response = await api.get<ApiResponse<User[]>>('/users/workers');
        return response.data.data || [];
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    create: async (data: CreateUserData): Promise<User> => {
        const response = await api.post<ApiResponse<User>>('/users', data);
        return response.data.data!;
    },

    update: async (id: string, data: Partial<CreateUserData>): Promise<User> => {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
