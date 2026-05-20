const express = require('express');

const Alert = require('../models/Alert');
const History = require('../models/History');
const Message = require('../models/Message');
const Pictogram = require('../models/Pictogram');
const Routine = require('../models/Routine');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeHistoryEntryForClient } = require('../utils/normalizeHistory');

const router = express.Router();

router.get(
  '/summary',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const [
      workersCount,
      pictogramsCount,
      workshopsCount,
      messagesCount,
      simplifiedProfiles,
      pendingAlerts,
      activeRoutines,
      completedRoutineEntries,
      recentHistory,
      recentPictograms,
      recentAlerts
    ] = await Promise.all([
      User.countDocuments({ role: 'worker' }),
      Pictogram.countDocuments({ isActive: true }),
      Workshop.countDocuments({ isActive: true }),
      Message.countDocuments({}),
      User.countDocuments({
        role: 'worker',
        'preferences.displayMode': 'simplified'
      }),
      Alert.countDocuments({ status: 'pending' }),
      User.countDocuments({
        role: 'worker',
        'routineAssignments.status': 'in_progress'
      }),
      History.countDocuments({ channel: 'routine' }),
      History.find({})
        .populate('worker', 'firstName lastName avatar')
        .populate('workshop', 'name color')
        .populate({
          path: 'message',
          populate: [
            {
              path: 'worker',
              select: 'firstName lastName avatar role assignedWorkshop'
            },
            {
              path: 'workshop',
              select: 'key name color icon'
            },
            {
              path: 'items.pictogram',
              select: 'key label imageUrl color builderText phrase'
            }
          ]
        })
        .populate('routine', 'title')
        .sort({ createdAt: -1 })
        .limit(6),
      Pictogram.find({})
        .populate('category', 'name color')
        .sort({ updatedAt: -1 })
        .limit(5),
      Alert.find({})
        .populate('workerId', 'firstName lastName avatar')
        .populate('respondedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.json({
      metrics: {
        workersCount,
        pictogramsCount,
        workshopsCount,
        messagesCount,
        simplifiedProfiles,
        pendingAlerts,
        activeRoutines,
        completedRoutineEntries
      },
      recentHistory: recentHistory.map(entry => normalizeHistoryEntryForClient(entry)),
      recentPictograms,
      recentAlerts
    });
  })
);

router.get(
  '/workers-overview',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const workers = await User.find({ role: 'worker' })
      .select('-password')
      .populate('assignedWorkshop', 'key name color icon')
      .populate('routineAssignments.routine', 'title estimatedMinutes')
      .sort({ firstName: 1, lastName: 1 });

    res.json(workers);
  })
);

router.get(
  '/routines-overview',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const routines = await Routine.find({ isActive: true })
      .populate('workshop', 'key name color icon')
      .populate('assignedTo', 'firstName lastName')
      .sort({ title: 1 });

    res.json(routines);
  })
);

module.exports = router;
