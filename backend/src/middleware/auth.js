const jwt = require('jsonwebtoken');

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const auth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw httpError(401, 'Authentification requise.');
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'altercom-dev-secret'
    );

    if (payload.type && payload.type !== 'access') {
      throw httpError(401, 'Jeton d acces invalide.');
    }

    const user = await User.findById(payload.sub).select('-password');

    if (!user) {
      throw httpError(401, 'Utilisateur introuvable.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw httpError(401, 'Jeton invalide ou expire.');
  }
});

module.exports = auth;
