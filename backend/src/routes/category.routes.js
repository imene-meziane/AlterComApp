const express = require('express');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

function resolveCategoryFilter(value) {
  if (!value) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    return { _id: value };
  }

  return { key: value.toLowerCase() };
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === 'worker'
        ? {
            visibleFor: req.user.role
          }
        : {};

    const categories = await Category.find(filter).sort({ order: 1, name: 1 });
    res.json(categories);
  })
);

router.post(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const { key, name, prompt, description, color, icon, visibleFor, order } = req.body;

    if (!key || !name) {
      throw httpError(400, 'Cle et nom de categorie requis.');
    }

    const existing = await Category.findOne({ key: key.toLowerCase().trim() });
    if (existing) {
      throw httpError(409, 'Cette categorie existe deja.');
    }

    const category = await Category.create({
      key,
      name,
      prompt,
      description,
      color,
      icon,
      order,
      visibleFor:
        Array.isArray(visibleFor) && visibleFor.length
          ? visibleFor
          : ['worker', 'supervisor']
    });

    res.status(201).json(category);
  })
);

router.put(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const category = await Category.findOne(resolveCategoryFilter(req.params.id));

    if (!category) {
      throw httpError(404, 'Categorie introuvable.');
    }

    const { key, name, prompt, description, color, icon, visibleFor, order } = req.body;

    if (key !== undefined) {
      category.key = key;
    }
    if (name !== undefined) {
      category.name = name;
    }
    if (prompt !== undefined) {
      category.prompt = prompt;
    }
    if (description !== undefined) {
      category.description = description;
    }
    if (color !== undefined) {
      category.color = color;
    }
    if (icon !== undefined) {
      category.icon = icon;
    }
    if (Array.isArray(visibleFor) && visibleFor.length) {
      category.visibleFor = visibleFor;
    }
    if (order !== undefined) {
      category.order = Number(order);
    }

    await category.save();
    res.json(category);
  })
);

router.delete(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const category = await Category.findOne(resolveCategoryFilter(req.params.id));

    if (!category) {
      throw httpError(404, 'Categorie introuvable.');
    }

    await category.deleteOne();
    res.status(204).send();
  })
);

module.exports = router;
