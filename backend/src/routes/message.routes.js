const express = require('express');
const mongoose = require('mongoose');

const Alert = require('../models/Alert');
const History = require('../models/History');
const Message = require('../models/Message');
const Pictogram = require('../models/Pictogram');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const {
  buildSentenceFromPictograms,
  normalizeSentence
} = require('../utils/buildSentence');
const { normalizeMessageForClient } = require('../utils/normalizeMessage');

const router = express.Router();

async function createHistoryEntry(message) {
  await History.create({
    worker: message.worker,
    workshop: message.workshop || null,
    message: message._id,
    text: message.text,
    channel: message.channel
  });
}

async function createEmergencyAlert(message) {
  return Alert.create({
    workerId: message.worker,
    type: 'urgence',
    priority: 'urgent',
    message: message.text,
    status: 'pending'
  });
}

async function populateMessage(messageId) {
  return Message.findById(messageId)
    .populate('worker', 'firstName lastName avatar role assignedWorkshop')
    .populate('workshop', 'key name color icon')
    .populate('items.pictogram', 'key label imageUrl color builderText phrase');
}

function extractPictogramIds(payload = {}) {
  const directIds = Array.isArray(payload.pictogramIds) ? payload.pictogramIds : [];
  const pictogramObjects = Array.isArray(payload.pictograms) ? payload.pictograms : [];
  const objectIds = pictogramObjects
    .map(pictogram => {
      if (!pictogram) {
        return null;
      }

      if (typeof pictogram === 'string') {
        return pictogram;
      }

      return pictogram.id || pictogram.sourceId || pictogram.pictogramId || null;
    })
    .filter(Boolean);

  return Array.from(new Set([...directIds, ...objectIds].map(id => String(id))));
}

function resolveWorkerFilter(req) {
  if (req.user.role === 'worker') {
    return req.user._id;
  }

  if (req.query.workerId && mongoose.Types.ObjectId.isValid(req.query.workerId)) {
    return req.query.workerId;
  }

  return undefined;
}

async function fetchMessages(filter, limit = 20) {
  const messages = await Message.find(filter)
    .populate('worker', 'firstName lastName avatar role assignedWorkshop')
    .populate('workshop', 'key name color icon')
    .populate('items.pictogram', 'key label imageUrl color builderText phrase')
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.map(message => normalizeMessageForClient(message));
}

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'worker') {
      throw httpError(403, 'Envoi de message réservé au travailleur.');
    }

    const pictogramIds = extractPictogramIds(req.body);

    if (!pictogramIds.length) {
      throw httpError(400, 'Choisis une image d’abord.');
    }

    const validIds = pictogramIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const rawPictograms = await Pictogram.find({
      _id: { $in: validIds },
      isActive: true
    });

    if (!rawPictograms.length) {
      throw httpError(400, 'Aucun pictogramme valide pour ce message.');
    }

    const pictogramOrder = new Map(pictogramIds.map((id, index) => [id, index]));
    const pictograms = rawPictograms.sort((left, right) => {
      return (pictogramOrder.get(left.id) || 0) - (pictogramOrder.get(right.id) || 0);
    });

    const assignedWorkshop =
      req.body.workshopId && mongoose.Types.ObjectId.isValid(req.body.workshopId)
        ? req.body.workshopId
        : req.user.assignedWorkshop || null;
    const text = normalizeSentence(req.body.text || buildSentenceFromPictograms(pictograms));

    if (!text) {
      throw httpError(400, 'Le message est vide.');
    }

    const message = await Message.create({
      worker: req.user._id,
      workshop: assignedWorkshop,
      items: pictograms.map(pictogram => ({
        pictogram: pictogram._id,
        label: pictogram.label,
        builderText: pictogram.builderText,
        imageUrl: pictogram.imageUrl,
        color: pictogram.color
      })),
      text,
      channel: 'message',
      status: 'sent',
      speechRate: Number(req.body.speechRate || req.user.preferences?.speechRate || 0.95),
      speechVolume: Number(req.body.speechVolume || req.user.preferences?.speechVolume || 1)
    });

    await createHistoryEntry(message);

    const createdMessage = await populateMessage(message._id);

    res.status(201).json({
      success: true,
      message: normalizeMessageForClient(createdMessage)
    });
  })
);

router.post(
  '/emergency',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'worker') {
      throw httpError(403, 'Urgence réservée au travailleur.');
    }

    const text = normalizeSentence(req.body.text || "J'ai besoin d'aide");

    const message = await Message.create({
      worker: req.user._id,
      workshop: req.user.assignedWorkshop || null,
      items: [],
      text,
      channel: 'emergency',
      status: 'sent',
      speechRate: Number(req.body.speechRate || req.user.preferences?.speechRate || 0.95),
      speechVolume: Number(req.body.speechVolume || req.user.preferences?.speechVolume || 1)
    });

    await createHistoryEntry(message);
    await createEmergencyAlert(message);

    const createdMessage = await populateMessage(message._id);

    res.status(201).json({
      success: true,
      message: normalizeMessageForClient(createdMessage)
    });
  })
);

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter = {};
    const workerFilter = resolveWorkerFilter(req);

    if (workerFilter) {
      filter.worker = workerFilter;
    }

    if (req.query.workshopId && mongoose.Types.ObjectId.isValid(req.query.workshopId)) {
      filter.workshop = req.query.workshopId;
    }

    if (req.query.channel) {
      filter.channel = req.query.channel;
    }

    const limit = Math.min(Number(req.query.limit || 50), 200);
    res.json(await fetchMessages(filter, limit));
  })
);

router.get(
  '/mine',
  auth,
  asyncHandler(async (req, res) => {
    res.json(await fetchMessages({ worker: req.user._id }, 20));
  })
);

router.get(
  '/worker/:workerId',
  auth,
  asyncHandler(async (req, res) => {
    const isSelf = req.user._id.toString() === req.params.workerId;

    if (!isSelf && req.user.role !== 'supervisor') {
      throw httpError(403, 'Accès refusé à cet historique.');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.workerId)) {
      throw httpError(400, 'Travailleur invalide.');
    }

    const limit = Math.min(Number(req.query.limit || 50), 200);
    res.json(await fetchMessages({ worker: req.params.workerId }, limit));
  })
);

module.exports = router;
