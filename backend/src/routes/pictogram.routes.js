const express = require('express');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const Pictogram = require('../models/Pictogram');
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

async function findCategoryReference(categoryValue) {
  if (!categoryValue) {
    return null;
  }

  const filter = mongoose.Types.ObjectId.isValid(categoryValue)
    ? { _id: categoryValue }
    : { key: String(categoryValue).toLowerCase().trim() };

  return Category.findOne(filter);
}

async function getAllowedCategoryIds(role) {
  const categories = await Category.find({ visibleFor: role }).select('_id');
  return categories.map(category => category._id);
}

async function findWorkshopReference(workshopValue) {
  if (!workshopValue) {
    return null;
  }

  const filter = mongoose.Types.ObjectId.isValid(workshopValue)
    ? { _id: workshopValue }
    : { key: String(workshopValue).toLowerCase().trim() };

  return Workshop.findOne(filter);
}

// Helper to normalize pictogram objects for the client
function normalizePictogramForClient(p) {
  if (!p) {
    return p;
  }

  const obj =
    typeof p.toJSON === 'function'
      ? p.toJSON()
      : typeof p.toObject === 'function'
        ? p.toObject()
        : { ...p };

  if (!obj.id && obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }

  // Prefer filePath (local asset under frontend/public) over remote imageUrl
  const preferred = obj.filePath || obj.imageUrl || null;
  // Provide both `image` and `imageUrl` fields for frontend compatibility
  obj.image = preferred;
  obj.imageUrl = preferred;
  return obj;
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.category) {
      const category = await findCategoryReference(req.query.category);
      if (!category) {
        res.json([]);
        return;
      }
      filter.category = category._id;
    }

    if (req.user.role === 'worker') {
      filter.isActive = true;
      const allowedIds = await getAllowedCategoryIds(req.user.role);
      filter.category = filter.category
        ? filter.category
        : { $in: allowedIds };

      if (req.user.preferences?.displayMode === 'simplified') {
        filter.showInSimplified = true;
      }
    }

    if (req.query.active && req.user.role === 'supervisor') {
      filter.isActive = req.query.active === 'true';
    }

    if (req.query.workshop) {
      const workshop = await findWorkshopReference(req.query.workshop);
      if (!workshop) {
        res.json([]);
        return;
      }

      filter.workshops = workshop._id;
    }

    if (req.query.q) {
      const value = String(req.query.q).trim();
      if (value) {
        filter.$or = [
          { label: { $regex: value, $options: 'i' } },
          { phrase: { $regex: value, $options: 'i' } },
          { spokenText: { $regex: value, $options: 'i' } },
          { keywords: { $elemMatch: { $regex: value, $options: 'i' } } }
        ];
      }
    }

    const pictograms = await Pictogram.find(filter)
      .populate('category', 'key name color icon visibleFor')
      .populate('workshops', 'key name color icon')
      .populate('createdBy', 'firstName lastName role')
      .sort({ label: 1 });

    // Normalize each pictogram for frontend compatibility
    const normalized = pictograms.map(normalizePictogramForClient);

    res.json(normalized);
  })
);

router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { key: req.params.id };

    const pictogram = await Pictogram.findOne(filter)
      .populate('category', 'key name color icon visibleFor')
      .populate('workshops', 'key name color icon')
      .populate('createdBy', 'firstName lastName role');

    if (!pictogram) {
      throw httpError(404, 'Pictogramme introuvable.');
    }

    if (req.user.role === 'worker') {
      const category = pictogram.category;
      const isVisible = category.visibleFor.includes('worker');
      const matchesMode =
        req.user.preferences?.displayMode === 'complete' || pictogram.showInSimplified;

      if (!pictogram.isActive || !isVisible || !matchesMode) {
        throw httpError(404, 'Pictogramme introuvable.');
      }
    }

    const normalized = normalizePictogramForClient(pictogram);
    res.json(normalized);
  })
);

router.post(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const {
      key,
      label,
      phrase,
      spokenText,
      builderText,
      keywords,
      category,
      workshops,
      imageUrl,
      filePath,
      source,
      sourceId,
      color,
      sourceLabel,
      showInSimplified,
      isActive = true
    } = req.body;

    // Validate required fields
    if (!key || !label || !phrase || !category) {
      throw httpError(400, 'Champs requis manquants pour le pictogramme.');
    }

    // Enforce trusted sources only
    const allowedSources = ['arasaac', 'sclera', 'local'];
    const picSource = source ? String(source).toLowerCase() : null;
    if (!picSource || !allowedSources.includes(picSource)) {
      throw httpError(400, 'Source invalide. Seules les sources arasaac, sclera ou local sont autorisées.');
    }

    // Require at least one asset pointer (local filePath or remote imageUrl)
    if (!filePath && !imageUrl) {
      throw httpError(400, 'Un chemin local (filePath) ou une URL (imageUrl) est requis pour le pictogramme.');
    }

    const categoryDoc = await findCategoryReference(category);
    if (!categoryDoc) {
      throw httpError(400, 'Categorie invalide.');
    }

    const pictogram = await Pictogram.create({
      key,
      label,
      phrase,
      spokenText,
      builderText,
      keywords: Array.isArray(keywords) ? keywords : [],
      category: categoryDoc._id,
      workshops: [],
      imageUrl: imageUrl || null,
      filePath: filePath || null,
      source: picSource,
      sourceId: sourceId || null,
      color,
      sourceLabel,
      showInSimplified,
      isActive,
      createdBy: req.user._id
    });

    if (Array.isArray(workshops) && workshops.length) {
      const workshopDocs = await Promise.all(workshops.map(workshop => findWorkshopReference(workshop)));
      pictogram.workshops = workshopDocs.filter(Boolean).map(workshop => workshop._id);
      await pictogram.save();
    }

    const populated = await Pictogram.findById(pictogram._id)
      .populate('category', 'key name color icon visibleFor')
      .populate('workshops', 'key name color icon')
      .populate('createdBy', 'firstName lastName role');

    const populatedNormalized = normalizePictogramForClient(populated);

    res.status(201).json(populatedNormalized);
  })
);

router.put(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { key: req.params.id };

    const pictogram = await Pictogram.findOne(filter);
    if (!pictogram) {
      throw httpError(404, 'Pictogramme introuvable.');
    }

    const {
      key,
      label,
      phrase,
      spokenText,
      builderText,
      keywords,
      category,
      workshops,
      imageUrl,
      filePath,
      source,
      sourceId,
      color,
      sourceLabel,
      showInSimplified,
      isActive
    } = req.body;

    // If source provided, validate it
    if (source !== undefined) {
      const allowedSources = ['arasaac', 'sclera', 'local'];
      const picSource = String(source).toLowerCase();
      if (!allowedSources.includes(picSource)) {
        throw httpError(400, 'Source invalide pour le pictogramme.');
      }
      pictogram.source = picSource;
    }

    // Update sourceId if provided
    if (sourceId !== undefined) {
      pictogram.sourceId = sourceId || null;
    }

    if (imageUrl !== undefined) pictogram.imageUrl = imageUrl;
    if (filePath !== undefined) pictogram.filePath = filePath;

    // If both are undefined and currently none exists, require at least one
    if (!pictogram.imageUrl && !pictogram.filePath) {
      throw httpError(400, 'Un chemin local (filePath) ou une URL (imageUrl) est requis pour le pictogramme.');
    }

    if (key !== undefined) {
      pictogram.key = key;
    }
    if (label !== undefined) {
      pictogram.label = label;
    }
    if (phrase !== undefined) {
      pictogram.phrase = phrase;
    }
    if (spokenText !== undefined) {
      pictogram.spokenText = spokenText;
    }
    if (builderText !== undefined) {
      pictogram.builderText = builderText;
    }
    if (Array.isArray(keywords)) {
      pictogram.keywords = keywords;
    }
    if (color !== undefined) {
      pictogram.color = color;
    }
    if (sourceLabel !== undefined) {
      pictogram.sourceLabel = sourceLabel;
    }
    if (showInSimplified !== undefined) {
      pictogram.showInSimplified = Boolean(showInSimplified);
    }
    if (isActive !== undefined) {
      pictogram.isActive = isActive;
    }

    if (category !== undefined) {
      const categoryDoc = await findCategoryReference(category);
      if (!categoryDoc) {
        throw httpError(400, 'Categorie invalide.');
      }
      pictogram.category = categoryDoc._id;
    }

    if (Array.isArray(workshops)) {
      const workshopDocs = await Promise.all(workshops.map(workshop => findWorkshopReference(workshop)));
      pictogram.workshops = workshopDocs.filter(Boolean).map(workshop => workshop._id);
    }

    await pictogram.save();

    const populated = await Pictogram.findById(pictogram._id)
      .populate('category', 'key name color icon visibleFor')
      .populate('workshops', 'key name color icon')
      .populate('createdBy', 'firstName lastName role');

    const populatedNormalized = normalizePictogramForClient(populated);

    res.json(populatedNormalized);
  })
);

router.delete(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { _id: req.params.id }
      : { key: req.params.id };

    const pictogram = await Pictogram.findOne(filter);
    if (!pictogram) {
      throw httpError(404, 'Pictogramme introuvable.');
    }

    await pictogram.deleteOne();
    res.status(204).send();
  })
);

module.exports = router;
