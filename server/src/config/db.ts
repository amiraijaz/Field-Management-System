import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = async (text: string, params?: unknown[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    }
    return res;
};

export const getClient = async () => {
    const client = await pool.connect();
    return client;
};

export const testConnection = async () => {
    try {
        const res = await query('SELECT NOW()');
        console.log('✅ Database connected:', res.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};
