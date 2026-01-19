// User roles enum
export enum UserRole {
    ADMIN = 'admin',
    WORKER = 'worker',
    CUSTOMER = 'customer',
}

// Base entity with common fields
export interface BaseEntity {
    id: string;
    created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
}

// Tenant/Company
export interface Tenant extends BaseEntity {
    name: string;
    is_active: boolean;
}

// User
export interface User extends BaseEntity {
    tenant_id: string;
    email: string;
    password_hash: string;
    name: string;
    role: UserRole;
}

export interface UserPublic {
    id: string;
    tenant_id: string;
    email: string;
    name: string;
    role: UserRole;
    created_at: Date;
}

// Customer
export interface Customer extends BaseEntity {
    tenant_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
}

// Job Status
export interface JobStatus extends BaseEntity {
    tenant_id: string;
    name: string;
    color: string;
    order_index: number;
}

// Job
export interface Job extends BaseEntity {
    tenant_id: string;
    customer_id: string;
    assigned_worker_id: string | null;
    status_id: string;
    title: string;
    description: string | null;
    scheduled_date: Date | null;
    is_archived: boolean;
    customer_access_token: string | null;
}

export interface JobWithDetails extends Job {
    customer_name: string;
    worker_name: string | null;
    status_name: string;
    status_color: string;
}

// Task
export interface Task extends BaseEntity {
    job_id: string;
    title: string;
    description: string | null;
    is_completed: boolean;
    completed_at: Date | null;
    completed_by: string | null;
}

// JWT Payload
export interface JwtPayload {
    userId: string;
    tenantId: string;
    role: UserRole;
    email: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Request with auth
import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: JwtPayload;
}
