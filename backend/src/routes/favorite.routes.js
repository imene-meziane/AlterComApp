const express = require('express');
const mongoose = require('mongoose');

const Favorite = require('../models/Favorite');
const Pictogram = require('../models/Pictogram');
const auth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const {
  buildSentenceFromPictograms,
  normalizeSentence
} = require('../utils/buildSentence');

const router = express.Router();

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const userId =
      req.user.role === 'supervisor' && req.query.userId
        ? req.query.userId
        : req.user._id;

    const favorites = await Favorite.find({ user: userId })
      .populate('pictogram', 'key label imageUrl color phrase')
      .populate('pictograms', 'key label imageUrl color builderText')
      .sort({ createdAt: -1 });

    res.json(favorites);
  })
);

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const userId =
      req.user.role === 'supervisor' && req.body.userId ? req.body.userId : req.user._id;
    const { kind } = req.body;

    if (!['pictogram', 'phrase'].includes(kind)) {
      throw httpError(400, 'Type de favori invalide.');
    }

    if (kind === 'pictogram') {
      const pictogramId = req.body.pictogramId;
      if (!mongoose.Types.ObjectId.isValid(pictogramId)) {
        throw httpError(400, 'Pictogramme favori invalide.');
      }

      const pictogram = await Pictogram.findById(pictogramId);
      if (!pictogram) {
        throw httpError(404, 'Pictogramme introuvable.');
      }

      const favorite = await Favorite.create({
        user: userId,
        kind,
        pictogram: pictogram._id,
        title: pictogram.label,
        text: pictogram.phrase,
        imageUrl: pictogram.imageUrl
      });

      res.status(201).json(
        await Favorite.findById(favorite._id).populate(
          'pictogram',
          'key label imageUrl color phrase'
        )
      );
      return;
    }

    const pictogramIds = Array.isArray(req.body.pictogramIds) ? req.body.pictogramIds : [];
    const pictograms = await Pictogram.find({
      _id: { $in: pictogramIds.filter(id => mongoose.Types.ObjectId.isValid(id)) }
    });

    const phraseText = normalizeSentence(req.body.text || buildSentenceFromPictograms(pictograms));

    if (!phraseText) {
      throw httpError(400, 'La phrase favorite est vide.');
    }

    const favorite = await Favorite.create({
      user: userId,
      kind,
      pictograms: pictograms.map(pictogram => pictogram._id),
      title: req.body.title || phraseText,
      text: phraseText,
      imageUrl: pictograms[0]?.imageUrl || ''
    });

    res.status(201).json(
      await Favorite.findById(favorite._id).populate(
        'pictograms',
        'key label imageUrl color builderText'
      )
    );
  })
);

router.delete(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      throw httpError(404, 'Favori introuvable.');
    }

    const isSelf = favorite.user.toString() === req.user._id.toString();
    if (!isSelf && req.user.role !== 'supervisor') {
      throw httpError(403, 'Suppression non autorisee.');
    }

    await favorite.deleteOne();
    res.status(204).send();
  })
);

module.exports = router;
