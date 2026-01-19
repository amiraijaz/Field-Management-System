import api from './api';
import { ApiResponse, Customer } from '@/types';

interface CreateCustomerData {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

export const customersApi = {
    getAll: async (search?: string): Promise<Customer[]> => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await api.get<ApiResponse<Customer[]>>(`/customers${params}`);
        return response.data.data || [];
    },

    getById: async (id: string): Promise<Customer> => {
        const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
        return response.data.data!;
    },

    create: async (data: CreateCustomerData): Promise<Customer> => {
        const response = await api.post<ApiResponse<Customer>>('/customers', data);
        return response.data.data!;
    },

    update: async (id: string, data: Partial<CreateCustomerData>): Promise<Customer> => {
        const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },
};
