const express = require('express');

const Favorite = require('../models/Favorite');
const History = require('../models/History');
const Routine = require('../models/Routine');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const sanitizeUser = require('../utils/sanitizeUser');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '')
    .toLowerCase()
    .trim();
}

async function resolveWorkshop(assignedWorkshop) {
  if (!assignedWorkshop) {
    return null;
  }

  const workshop = await Workshop.findOne({
    $or: [{ _id: assignedWorkshop }, { key: String(assignedWorkshop).toLowerCase().trim() }]
  });

  if (!workshop) {
    throw httpError(400, 'Atelier invalide.');
  }

  return workshop;
}

async function populateUser(userId) {
  return User.findById(userId)
    .select('-password')
    .populate('assignedWorkshop', 'key name color icon description')
    .populate('routineAssignments.routine', 'key title estimatedMinutes difficulty workshop')
    .populate({
      path: 'routineAssignments.routine',
      populate: {
        path: 'workshop',
        select: 'key name color icon'
      }
    });
}

function buildRoutineAssignments(routines = []) {
  return routines.map(routine => ({
    routine: routine._id,
    status: 'assigned',
    currentStepIndex: 0,
    completedStepIndexes: [],
    lastStartedAt: null,
    lastCompletedAt: null
  }));
}

async function syncRoutineAssignmentsForWorker(workerId, routines) {
  await Routine.updateMany(
    { assignedTo: workerId },
    { $pull: { assignedTo: workerId } }
  );

  if (routines.length) {
    await Routine.updateMany(
      { _id: { $in: routines.map(routine => routine._id) } },
      { $addToSet: { assignedTo: workerId } }
    );
  }
}

router.get(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('assignedWorkshop', 'key name color icon')
      .populate('routineAssignments.routine', 'key title estimatedMinutes difficulty')
      .sort({ firstName: 1, lastName: 1 });

    const favoriteCounts = await Favorite.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      }
    ]);
    const historyCounts = await History.aggregate([
      {
        $group: {
          _id: '$worker',
          count: { $sum: 1 }
        }
      }
    ]);

    const favoritesMap = new Map(
      favoriteCounts.map(item => [item._id.toString(), item.count])
    );
    const historyMap = new Map(
      historyCounts.map(item => [item._id.toString(), item.count])
    );

    res.json(
      users.map(user => {
        const safeUser = sanitizeUser(user);
        return {
          ...safeUser,
          favoriteCount: favoritesMap.get(user.id) || 0,
          historyCount: historyMap.get(user.id) || 0,
          routineCount: user.routineAssignments?.length || 0,
          activeRoutineCount:
            user.routineAssignments?.filter(assignment => assignment.status !== 'completed').length ||
            0
        };
      })
    );
  })
);

router.post(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password = 'AlterCom123!',
      avatar = '',
      assignedWorkshop,
      simplificationLevel = 'high',
      supportNeeds = [],
      preferences = {},
      routineIds = []
    } = req.body;

    if (!firstName || !lastName || !email) {
      throw httpError(400, 'Prenom, nom et email sont requis.');
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw httpError(409, 'Un travailleur existe deja avec cet email.');
    }

    const workshop = await resolveWorkshop(assignedWorkshop);
    const routines = routineIds.length
      ? await Routine.find({ _id: { $in: routineIds } })
      : [];

    const worker = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      avatar,
      role: 'worker',
      assignedWorkshop: workshop?._id || null,
      simplificationLevel,
      supportNeeds: Array.isArray(supportNeeds) ? supportNeeds : [],
      preferences: {
        displayMode: 'simplified',
        speechRate: 0.95,
        speechVolume: 1,
        showSearch: false,
        textScale: 'large',
        contrastMode: 'standard',
        animationMode: 'calm',
        ...preferences
      },
      routineAssignments: buildRoutineAssignments(routines)
    });

    await syncRoutineAssignmentsForWorker(worker._id, routines);

    const populated = await populateUser(worker._id);
    res.status(201).json(sanitizeUser(populated));
  })
);

router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const canAccess =
      req.user.role === 'supervisor' || req.user._id.toString() === req.params.id;

    if (!canAccess) {
      throw httpError(403, 'Acces refuse a cet utilisateur.');
    }

    const user = await populateUser(req.params.id);

    if (!user) {
      throw httpError(404, 'Utilisateur introuvable.');
    }

    res.json(sanitizeUser(user));
  })
);

router.put(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const isSelf = req.user._id.toString() === req.params.id;
    const isSupervisor = req.user.role === 'supervisor';

    if (!isSelf && !isSupervisor) {
      throw httpError(403, 'Modification non autorisee.');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw httpError(404, 'Utilisateur introuvable.');
    }

    const {
      firstName,
      lastName,
      avatar,
      assignedWorkshop,
      preferences,
      role,
      simplificationLevel,
      supportNeeds,
      routineIds
    } = req.body;

    if (firstName !== undefined) {
      user.firstName = firstName;
    }
    if (lastName !== undefined) {
      user.lastName = lastName;
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    if (preferences && typeof preferences === 'object') {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (isSupervisor && simplificationLevel !== undefined) {
      user.simplificationLevel = simplificationLevel;
    }

    if (isSupervisor && supportNeeds !== undefined) {
      user.supportNeeds = Array.isArray(supportNeeds)
        ? supportNeeds.filter(Boolean)
        : [];
    }

    if (isSupervisor && assignedWorkshop !== undefined) {
      const workshop = await resolveWorkshop(assignedWorkshop);
      user.assignedWorkshop = workshop?._id || null;
    }

    if (isSupervisor && role && ['worker', 'supervisor'].includes(role)) {
      user.role = role;
    }

    if (isSupervisor && routineIds !== undefined) {
      const routines = Array.isArray(routineIds) && routineIds.length
        ? await Routine.find({ _id: { $in: routineIds } })
        : [];

      user.routineAssignments = buildRoutineAssignments(routines);
      await syncRoutineAssignmentsForWorker(user._id, routines);
    }

    await user.save();

    const refreshedUser = await populateUser(user._id);
    res.json(sanitizeUser(refreshedUser));
  })
);

module.exports = router;
