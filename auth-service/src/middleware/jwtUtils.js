const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret';

function generateToken(payload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };