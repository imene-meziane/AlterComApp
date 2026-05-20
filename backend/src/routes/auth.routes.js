const express = require('express');

const User = require('../models/User');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken
} = require('../utils/generateToken');
const httpError = require('../utils/httpError');
const sanitizeUser = require('../utils/sanitizeUser');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '')
    .toLowerCase()
    .trim();
}

function cleanSessions(user) {
  const now = Date.now();
  user.sessions = (user.sessions || []).filter(session => {
    return new Date(session.expiresAt).getTime() > now;
  });
}

function createSession(user, userAgent = '') {
  const refreshToken = createRefreshToken(user);
  const refreshPayload = verifyRefreshToken(refreshToken);

  cleanSessions(user);
  user.sessions.push({
    tokenHash: hashToken(refreshToken),
    userAgent,
    expiresAt: new Date(refreshPayload.exp * 1000),
    lastUsedAt: new Date()
  });
  user.lastLoginAt = new Date();

  return refreshToken;
}

function buildAuthPayload(user, refreshToken) {
  const accessToken = createAccessToken(user);

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: sanitizeUser(user)
  };
}

async function registerSupervisor(req, res) {
  const { firstName, lastName, email, password, avatar = '' } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw httpError(400, 'Prénom, nom, email et mot de passe sont requis.');
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw httpError(409, 'Un compte existe déjà avec cet email.');
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    role: 'supervisor',
    avatar,
    simplificationLevel: 'low',
    preferences: {
      displayMode: 'complete',
      speechRate: 1,
      speechVolume: 1,
      showSearch: true,
      textScale: 'standard',
      contrastMode: 'standard',
      animationMode: 'calm'
    }
  });

  const refreshToken = createSession(user, req.headers['user-agent'] || '');
  await user.save();

  res.status(201).json(buildAuthPayload(user, refreshToken));
}

router.post('/register', asyncHandler(registerSupervisor));
router.post('/register-supervisor', asyncHandler(registerSupervisor));

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw httpError(400, 'Email et mot de passe requis.');
    }

    const user = await User.findOne({
      email: normalizeEmail(email)
    });

    if (!user) {
      console.log(`[Auth] Login failed: User not found with email ${email}`);
      throw httpError(401, 'Identifiants invalides.');
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      console.log(`[Auth] Login failed: Invalid password for user ${email}`);
      throw httpError(401, 'Identifiants invalides.');
    }

    const refreshToken = createSession(user, req.headers['user-agent'] || '');
    await user.save();

    const authPayload = buildAuthPayload(user, refreshToken);
    console.log(`[Auth] Login successful for user ${email}`);
    console.log(`[Auth] Auth payload structure:`, Object.keys(authPayload));
    
    res.json(authPayload);
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw httpError(400, 'Refresh token requis.');
    }

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw httpError(401, 'Session expirée ou invalide.');
    }

    if (payload.type !== 'refresh') {
      throw httpError(401, 'Jeton de session invalide.');
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw httpError(401, 'Utilisateur introuvable.');
    }

    cleanSessions(user);
    const previousHash = hashToken(refreshToken);
    const existingSession = user.sessions.find(session => session.tokenHash === previousHash);

    if (!existingSession) {
      throw httpError(401, 'Session introuvable.');
    }

    user.sessions = user.sessions.filter(session => session.tokenHash !== previousHash);
    const nextRefreshToken = createSession(user, req.headers['user-agent'] || '');
    await user.save();

    res.json(buildAuthPayload(user, nextRefreshToken));
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(204).send();
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await User.findById(payload.sub);

      if (user) {
        const tokenHash = hashToken(refreshToken);
        user.sessions = (user.sessions || []).filter(session => session.tokenHash !== tokenHash);
        await user.save();
      }
    } catch (error) {
      // Intentionally ignore invalid refresh tokens during logout.
    }

    res.status(204).send();
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('assignedWorkshop', 'key name color icon description')
      .populate('routineAssignments.routine', 'key title estimatedMinutes difficulty steps workshop')
      .populate({
        path: 'routineAssignments.routine',
        populate: {
          path: 'workshop',
          select: 'key name color icon'
        }
      });

    res.json(sanitizeUser(user));
  })
);

module.exports = router;
