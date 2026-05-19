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
    .populate('items.pictogram', 'key label imageUrl color');
}

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { pictogramIds = [], speechRate, speechVolume, workshopId } = req.body;

    if (req.user.role !== 'worker') {
      throw httpError(403, 'Envoi de message reserve au travailleur.');
    }

    if (!Array.isArray(pictogramIds) || !pictogramIds.length) {
      throw httpError(400, 'Choisis au moins un pictogramme.');
    }

    const objectIds = pictogramIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const pictograms = await Pictogram.find({
      _id: { $in: objectIds },
      isActive: true
    });

    if (!pictograms.length) {
      throw httpError(400, 'Aucun pictogramme valide pour ce message.');
    }

    const message = await Message.create({
      worker: req.user._id,
      workshop: workshopId && mongoose.Types.ObjectId.isValid(workshopId) ? workshopId : req.user.assignedWorkshop,
      items: pictograms.map(pictogram => ({
        pictogram: pictogram._id,
        label: pictogram.label,
        builderText: pictogram.builderText,
        imageUrl: pictogram.imageUrl,
        color: pictogram.color
      })),
      text: buildSentenceFromPictograms(pictograms),
      channel: 'message',
      speechRate: Number(speechRate || req.user.preferences?.speechRate || 0.95),
      speechVolume: Number(speechVolume || req.user.preferences?.speechVolume || 1)
    });

    await createHistoryEntry(message);
    await createEmergencyAlert(message);

    res.status(201).json(await populateMessage(message._id));
  })
);

router.post(
  '/emergency',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'worker') {
      throw httpError(403, 'Urgence reservee au travailleur.');
    }

    const text = normalizeSentence(req.body.text || "j'ai besoin d'aide");

    const message = await Message.create({
      worker: req.user._id,
      workshop: req.user.assignedWorkshop || null,
      items: [],
      text,
      channel: 'emergency',
      speechRate: Number(req.body.speechRate || req.user.preferences?.speechRate || 0.95),
      speechVolume: Number(req.body.speechVolume || req.user.preferences?.speechVolume || 1)
    });

    await createHistoryEntry(message);

    res.status(201).json(await populateMessage(message._id));
  })
);

router.get(
  '/mine',
  auth,
  asyncHandler(async (req, res) => {
    const workerId =
      req.user.role === 'supervisor' && req.query.workerId
        ? req.query.workerId
        : req.user._id;

    const messages = await Message.find({ worker: workerId })
      .populate('workshop', 'key name color icon')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(messages);
  })
);

module.exports = router;
