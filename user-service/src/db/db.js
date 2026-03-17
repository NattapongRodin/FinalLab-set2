const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('[user-service] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[user-service] Postgres error:', err);
});

// สร้าง table ถ้ายังไม่มี
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('[user-service] Users table ready');
  } catch (err) {
    console.error('[user-service] Error creating table:', err);
  }
}

initDB();

module.exports = { pool };