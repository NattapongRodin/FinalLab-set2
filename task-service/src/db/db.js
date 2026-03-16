const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('[task-service] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[task-service] Postgres error:', err);
});

module.exports = { pool };