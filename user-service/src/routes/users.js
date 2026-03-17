async function ensureProfile(user) {

  const userId = user.sub || user.id;

  // 🔹 สร้าง table ถ้ายังไม่มี
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT,
      role TEXT,
      display_name TEXT,
      bio TEXT,
      avatar_url TEXT,
      updated_at TIMESTAMP
    );
  `);

  const existing = await pool.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0];
  }

  const created = await pool.query(
    `INSERT INTO user_profiles
      (user_id, username, email, role, display_name, bio, avatar_url, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     RETURNING *`,
    [
      userId,
      user.username,
      user.email,
      user.role,
      user.username || '',
      '',
      ''
    ]
  );

  return created.rows[0];
}