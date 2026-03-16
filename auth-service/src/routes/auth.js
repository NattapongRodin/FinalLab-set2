// เพิ่มไว้ด้านบนสุดของไฟล์
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ฟังก์ชันสร้างตารางอัตโนมัติ
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'member',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- สร้าง User Admin เริ่มต้น
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@lab.local', '$2b$10$okyFJxZ0iXJiyrS4zDKPzuWsql.anN7nADdWaPIvawc0adhKHQUDK', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Failed to init DB:", err);
  }
}

initDB(); // เรียกใช้งานทันทีที่เปิดเครื่อง

const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../db/db');
const { generateToken, verifyToken } = require('../middleware/jwtUtils');

const router = express.Router();

// health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, password are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [normalizedEmail, normalizedUsername]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'member')
       RETURNING id, username, email, role, created_at`,
      [normalizedUsername, normalizedEmail, passwordHash]
    );

    return res.status(201).json({
      message: 'Register success',
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
      [normalizedEmail]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });

    return res.json({
      message: 'Login success',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// me
router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = verifyToken(token);

    const result = await pool.query(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;