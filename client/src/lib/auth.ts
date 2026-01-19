import api from './api';
import { ApiResponse, User, AuthResponse } from '@/types';

export const authApi = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
        if (response.data.data) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
        }
        return response.data.data!;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
        }
    },

    me: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data!;
    },

    refresh: async (): Promise<string> => {
        const response = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
        const token = response.data.data!.accessToken;
        localStorage.setItem('accessToken', token);
        return token;
    },
};
