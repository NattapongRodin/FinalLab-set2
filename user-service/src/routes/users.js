const express = require('express');
const { pool } = require('../db/db');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

// health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// ใช้ auth หลังจากนี้
router.use(requireAuth);

// 🔥 ฟังก์ชันหลัก (แก้ครบแล้ว)
async function ensureProfile(user) {
  try {

    const userId = String(user.sub || user.id || '');

    const username = user.username || 'user';
    const email = user.email || '';
    const role = user.role || 'user';

    // ✅ สร้าง table ถ้ายังไม่มี
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        email TEXT,
        role TEXT,
        display_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        updated_at TIMESTAMP
      )
    `);

    // ✅ หา user
    const existing = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existing.rowCount > 0) {
      return existing.rows[0];
    }

    // ✅ ถ้าไม่มี → สร้างใหม่
    const created = await pool.query(
      `INSERT INTO user_profiles
      (user_id, username, email, role, display_name, bio, avatar_url, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING *`,
      [
        userId,
        username,
        email,
        role,
        username,
        '',
        ''
      ]
    );

    return created.rows[0];

  } catch (err) {
    console.error("ensureProfile error:", err);
    throw err;
  }
}

// GET profile
router.get('/me', async (req, res) => {
  try {
    const profile = await ensureProfile(req.user);
    res.json({ profile });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE profile
router.put('/me', async (req, res) => {
  try {

    const userId = String(req.user.sub || req.user.id || '');
    const { display_name, bio, avatar_url } = req.body;

    await ensureProfile(req.user);

    const result = await pool.query(
      `UPDATE user_profiles
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url),
           username = $4,
           email = $5,
           role = $6,
           updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      [
        display_name,
        bio,
        avatar_url,
        req.user.username || 'user',
        req.user.email || '',
        req.user.role || 'user',
        userId
      ]
    );

    res.json({ profile: result.rows[0] });

  } catch (err) {
    console.error("PUT /me error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// admin only
router.get('/', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles ORDER BY user_id ASC'
    );

    res.json({
      users: result.rows,
      count: result.rowCount
    });

  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;