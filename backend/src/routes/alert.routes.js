const express = require('express');

const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

async function populateAlert(alertId) {
  return Alert.findById(alertId)
    .populate('workerId', 'firstName lastName avatar email role assignedWorkshop')
    .populate('respondedBy', 'firstName lastName avatar role');
}

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const {
      workerId,
      type,
      message,
      priority = 'important'
    } = req.body;

    if (!type || !message) {
      throw httpError(400, 'Type et message requis pour une alerte.');
    }

    const alert = await Alert.create({
      workerId: req.user.role === 'worker' ? req.user._id : workerId || req.user._id,
      type,
      priority,
      message,
      status: 'pending'
    });

    res.status(201).json(await populateAlert(alert._id));
  })
);

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === 'supervisor'
        ? {}
        : {
            workerId: req.user._id
          };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const alerts = await Alert.find(filter)
      .populate('workerId', 'firstName lastName avatar email role assignedWorkshop')
      .populate('respondedBy', 'firstName lastName avatar role')
      .sort({ createdAt: -1 });

    res.json(alerts);
  })
);

router.put(
  '/:id/status',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const { status, responseNote = '' } = req.body;
    if (!['pending', 'seen', 'resolved'].includes(status)) {
      throw httpError(400, 'Statut d alerte invalide.');
    }

    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      throw httpError(404, 'Alerte introuvable.');
    }

    alert.status = status;
    alert.responseNote = responseNote;
    alert.respondedBy = req.user._id;
    alert.respondedAt = new Date();
    alert.resolvedAt = status === 'resolved' ? new Date() : null;
    await alert.save();

    res.json(await populateAlert(alert._id));
  })
);

module.exports = router;
