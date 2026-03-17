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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        display_name VARCHAR(100),
        bio TEXT
      );
    `);

    console.log('[user-service] Users & Profiles tables ready');

  } catch (err) {
    console.error('[user-service] DB init error:', err);
  }
}

initDB();

module.exports = { pool };