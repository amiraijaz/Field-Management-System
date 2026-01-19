import { pool } from '../config/db';
import { hashPassword } from '../utils/password';

async function seed() {
    const client = await pool.connect();

    try {
        console.log('🌱 Seeding database...');

        // Check if already seeded
        const existingTenant = await client.query(
            "SELECT id FROM tenants WHERE name = 'Default Company' LIMIT 1"
        );

        if (existingTenant.rows.length > 0) {
            console.log('⏭️  Database already seeded, skipping...');
            return;
        }

        // Create default tenant
        const tenantResult = await client.query(`
      INSERT INTO tenants (name, is_active)
      VALUES ('Default Company', true)
      RETURNING id
    `);
        const tenantId = tenantResult.rows[0].id;
        console.log('✅ Created default tenant:', tenantId);

        // Create admin user: admin@fieldservice.com / admin123
        const adminPassword = await hashPassword('admin123');
        await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, name, role)
      VALUES ($1, 'admin@fieldservice.com', $2, 'Admin User', 'admin')
    `, [tenantId, adminPassword]);
        console.log('✅ Created admin user: admin@fieldservice.com / admin123');

        // Create a sample worker
        const workerPassword = await hashPassword('worker123');
        await client.query(`
      INSERT INTO users (tenant_id, email, password_hash, name, role)
      VALUES ($1, 'worker@fieldservice.com', $2, 'John Worker', 'worker')
    `, [tenantId, workerPassword]);
        console.log('✅ Created worker user: worker@fieldservice.com / worker123');

        // Create default job statuses
        const statuses = [
            { name: 'New', color: '#6366f1', order: 0 },
            { name: 'In Progress', color: '#f59e0b', order: 1 },
            { name: 'On Hold', color: '#ef4444', order: 2 },
            { name: 'Completed', color: '#22c55e', order: 3 },
        ];

        for (const status of statuses) {
            await client.query(`
        INSERT INTO job_statuses (tenant_id, name, color, order_index)
        VALUES ($1, $2, $3, $4)
      `, [tenantId, status.name, status.color, status.order]);
        }
        console.log('✅ Created default job statuses');

        // Create a sample customer
        const customerResult = await client.query(`
      INSERT INTO customers (tenant_id, name, email, phone, address)
      VALUES ($1, 'Acme Corporation', 'contact@acme.com', '+1-555-123-4567', '123 Main St, City, State 12345')
      RETURNING id
    `, [tenantId]);
        console.log('✅ Created sample customer');

        // Get worker and status IDs for sample job
        const workerResult = await client.query(
            "SELECT id FROM users WHERE email = 'worker@fieldservice.com'"
        );
        const statusResult = await client.query(
            "SELECT id FROM job_statuses WHERE tenant_id = $1 AND name = 'New'",
            [tenantId]
        );

        // Create a sample job
        await client.query(`
      INSERT INTO jobs (tenant_id, customer_id, assigned_worker_id, status_id, title, description, scheduled_date)
      VALUES ($1, $2, $3, $4, 'Initial Equipment Setup', 'Install and configure equipment at customer site.', CURRENT_DATE + INTERVAL '7 days')
    `, [tenantId, customerResult.rows[0].id, workerResult.rows[0].id, statusResult.rows[0].id]);
        console.log('✅ Created sample job');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin: admin@fieldservice.com / admin123');
        console.log('   Worker: worker@fieldservice.com / worker123');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch(console.error);
