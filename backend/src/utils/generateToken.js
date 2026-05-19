const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET || 'altercom-dev-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'altercom-refresh-dev-secret';

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: 'access'
    },
    ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h'
    }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: 'refresh'
    },
    REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken
};
