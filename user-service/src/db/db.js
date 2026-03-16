const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('[user-service] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[user-service] Postgres error:', err);
});

module.exports = { pool };