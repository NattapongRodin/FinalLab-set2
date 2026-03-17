const { verifyToken } = require('./jwtUtils');

module.exports = function requireAuth(req, res, next) {

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {

    const decoded = verifyToken(token);

    // 🔹 normalize user object
    req.user = {
      sub: decoded.sub || decoded.id || '',
      username: decoded.username || decoded.email || 'user',
      email: decoded.email || '',
      role: decoded.role || 'user'
    };

    next();

  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ error: 'Invalid token' });
  }

};