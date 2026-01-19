import { query } from '../../config/db';
import { User, UserPublic, UserRole } from '../../types/index';
import { hashPassword } from '../../utils/password';

interface CreateUserData {
    tenantId: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

interface UpdateUserData {
    name?: string;
    email?: string;
    role?: UserRole;
    password?: string;
}

export const getUsers = async (tenantId: string): Promise<UserPublic[]> => {
    const result = await query(
        `SELECT id, tenant_id, email, name, role, created_at 
     FROM users 
     WHERE tenant_id = $1 AND is_deleted = false 
     ORDER BY created_at DESC`,
        [tenantId]
    );
    return result.rows;
};

export const getUserById = async (tenantId: string, userId: string): Promise<UserPublic | null> => {
    const result = await query(
        `SELECT id, tenant_id, email, name, role, created_at 
     FROM users 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [userId, tenantId]
    );
    return result.rows[0] || null;
};

export const createUser = async (data: CreateUserData): Promise<UserPublic> => {
    const passwordHash = await hashPassword(data.password);

    const result = await query(
        `INSERT INTO users (tenant_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tenant_id, email, name, role, created_at`,
        [data.tenantId, data.email.toLowerCase(), passwordHash, data.name, data.role]
    );

    return result.rows[0];
};

export const updateUser = async (
    tenantId: string,
    userId: string,
    data: UpdateUserData
): Promise<UserPublic | null> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }
    if (data.email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(data.email.toLowerCase());
    }
    if (data.role) {
        updates.push(`role = $${paramIndex++}`);
        values.push(data.role);
    }
    if (data.password) {
        updates.push(`password_hash = $${paramIndex++}`);
        values.push(await hashPassword(data.password));
    }

    if (updates.length === 0) return getUserById(tenantId, userId);

    values.push(userId, tenantId);

    const result = await query(
        `UPDATE users SET ${updates.join(', ')} 
     WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} AND is_deleted = false
     RETURNING id, tenant_id, email, name, role, created_at`,
        values
    );

    return result.rows[0] || null;
};

export const deleteUser = async (tenantId: string, userId: string): Promise<boolean> => {
    const result = await query(
        `UPDATE users SET is_deleted = true 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [userId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
};

export const getWorkers = async (tenantId: string): Promise<UserPublic[]> => {
    const result = await query(
        `SELECT id, tenant_id, email, name, role, created_at 
     FROM users 
     WHERE tenant_id = $1 AND role = 'worker' AND is_deleted = false 
     ORDER BY name ASC`,
        [tenantId]
    );
    return result.rows;
};
