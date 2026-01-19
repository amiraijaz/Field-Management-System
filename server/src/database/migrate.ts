import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

async function migrate() {
    const client = await pool.connect();

    try {
        console.log('🔄 Running migrations...');

        // Create migrations tracking table
        await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Get list of migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            // Check if already executed
            const result = await client.query(
                'SELECT id FROM migrations WHERE name = $1',
                [file]
            );

            if (result.rows.length > 0) {
                console.log(`⏭️  Skipping ${file} (already executed)`);
                continue;
            }

            // Read and execute migration
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`▶️  Executing ${file}...`);
            await client.query(sql);

            // Record migration
            await client.query(
                'INSERT INTO migrations (name) VALUES ($1)',
                [file]
            );

            console.log(`✅ Completed ${file}`);
        }

        console.log('✅ All migrations complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);
