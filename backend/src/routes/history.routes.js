const express = require('express');

const History = require('../models/History');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const { normalizeHistoryEntryForClient } = require('../utils/normalizeHistory');

const router = express.Router();

router.get(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.workerId) {
      filter.worker = req.query.workerId;
    }

    if (req.query.workshopId) {
      filter.workshop = req.query.workshopId;
    }

    if (req.query.channel) {
      filter.channel = req.query.channel;
    }

    const limit = Math.min(Number(req.query.limit || 50), 200);

    const history = await History.find(filter)
      .populate('worker', 'firstName lastName avatar assignedWorkshop')
      .populate('workshop', 'key name color icon')
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
      .populate('routine', 'title estimatedMinutes difficulty')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(history.map(entry => normalizeHistoryEntryForClient(entry)));
  })
);

module.exports = router;
