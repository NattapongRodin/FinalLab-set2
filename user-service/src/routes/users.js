const express = require('express');
const { pool } = require('../db/db');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

router.use(requireAuth);

async function ensureProfile(user) {
  const existing = await pool.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [user.sub]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const created = await pool.query(
    `INSERT INTO user_profiles
      (user_id, username, email, role, display_name, bio, avatar_url, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      user.sub,
      user.username,
      user.email,
      user.role,
      user.username,
      '',
      ''
    ]
  );

  return created.rows[0];
}

// GET /api/users/me
router.get('/me', async (req, res) => {
  try {
    const profile = await ensureProfile(req.user);
    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', async (req, res) => {
  const { display_name, bio, avatar_url } = req.body;

  try {
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
        req.user.username,
        req.user.email,
        req.user.role,
        req.user.sub
      ]
    );

    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users  admin only
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
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;