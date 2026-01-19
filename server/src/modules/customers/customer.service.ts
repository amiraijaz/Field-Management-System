import { query } from '../../config/db';
import { Customer } from '../../types/index';

interface CreateCustomerData {
    tenantId: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface UpdateCustomerData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export const getCustomers = async (tenantId: string, search?: string): Promise<Customer[]> => {
    let sql = `
    SELECT id, tenant_id, name, email, phone, address, created_at, updated_at
    FROM customers 
    WHERE tenant_id = $1 AND is_deleted = false`;

    const params: unknown[] = [tenantId];

    if (search) {
        sql += ` AND (name ILIKE $2 OR email ILIKE $2)`;
        params.push(`%${search}%`);
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    return result.rows;
};

export const getCustomerById = async (tenantId: string, customerId: string): Promise<Customer | null> => {
    const result = await query(
        `SELECT id, tenant_id, name, email, phone, address, created_at, updated_at
     FROM customers 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [customerId, tenantId]
    );
    return result.rows[0] || null;
};

export const createCustomer = async (data: CreateCustomerData): Promise<Customer> => {
    const result = await query(
        `INSERT INTO customers (tenant_id, name, email, phone, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tenant_id, name, email, phone, address, created_at, updated_at`,
        [data.tenantId, data.name, data.email || null, data.phone || null, data.address || null]
    );
    return result.rows[0];
};

export const updateCustomer = async (
    tenantId: string,
    customerId: string,
    data: UpdateCustomerData
): Promise<Customer | null> => {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
        updates.push(`name = $${paramIndex++}`);
        values.push(data.name);
    }
    if (data.email !== undefined) {
        updates.push(`email = $${paramIndex++}`);
        values.push(data.email);
    }
    if (data.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(data.phone);
    }
    if (data.address !== undefined) {
        updates.push(`address = $${paramIndex++}`);
        values.push(data.address);
    }

    if (updates.length === 0) return getCustomerById(tenantId, customerId);

    values.push(customerId, tenantId);

    const result = await query(
        `UPDATE customers SET ${updates.join(', ')} 
     WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex} AND is_deleted = false
     RETURNING id, tenant_id, name, email, phone, address, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
};

export const deleteCustomer = async (tenantId: string, customerId: string): Promise<boolean> => {
    const result = await query(
        `UPDATE customers SET is_deleted = true 
     WHERE id = $1 AND tenant_id = $2 AND is_deleted = false`,
        [customerId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
};
