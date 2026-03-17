const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('[task-service] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[task-service] Postgres error:', err);
});

// สร้าง table ถ้ายังไม่มี
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'TODO',
        priority VARCHAR(10) DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('[task-service] Tasks table ready');
  } catch (err) {
    console.error('[task-service] Error creating table:', err);
  }
}

initDB();

module.exports = { pool };