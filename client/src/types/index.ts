// User roles
export type UserRole = 'admin' | 'worker' | 'customer';

// Base entity
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
}

// User
export interface User extends BaseEntity {
    tenant_id: string;
    email: string;
    name: string;
    role: UserRole;
}

// Customer
export interface Customer extends BaseEntity {
    tenant_id: string;
    name: string;
    email: string | null;
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

// Task
export interface Task extends BaseEntity {
    job_id: string;
    title: string;
    description: string | null;
    is_completed: boolean;
    completed_at: string | null;
    completed_by: string | null;
}

// Job
export interface Job extends BaseEntity {
    tenant_id: string;
    customer_id: string;
    assigned_worker_id: string | null;
    status_id: string;
    title: string;
    description: string | null;
    scheduled_date: string | null;
    is_archived: boolean;
    customer_access_token: string | null;
}

// Attachment
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

// Signature
export interface Signature {
    id: string;
    job_id: string;
    signer_type: 'worker' | 'customer';
    signer_id: string | null;
    signer_name: string;
    signature_data: string;
    signed_at: string;
}

// Job with details (includes joined data)
export interface JobWithDetails extends Job {
    customer_name: string;
    worker_name: string | null;
    status_name: string;
    status_color: string;
    tasks?: Task[];
    attachments?: Attachment[];
    signatures?: Signature[];
}

// Auth response
export interface AuthResponse {
    user: User;
    accessToken: string;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
