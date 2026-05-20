const express = require('express');
const mongoose = require('mongoose');

const Pictogram = require('../models/Pictogram');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

function resolveWorkshopFilter(value) {
  if (!value) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(value)) {
    return { _id: value };
  }

  return { key: String(value).toLowerCase().trim() };
}

async function populateWorkshop(workshopId) {
  return Workshop.findById(workshopId);
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role === 'worker') {
      if (!req.user.assignedWorkshop) {
        res.json([]);
        return;
      }

      const workshop = await populateWorkshop(req.user.assignedWorkshop);
      res.json(workshop ? [workshop] : []);
      return;
    }

    const workshops = await Workshop.find({}).sort({ name: 1 });

    const workerCounts = await User.aggregate([
      {
        $match: {
          role: 'worker',
          assignedWorkshop: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$assignedWorkshop',
          count: { $sum: 1 }
        }
      }
    ]);

    const pictogramCounts = await Pictogram.aggregate([
      {
        $unwind: '$workshops'
      },
      {
        $group: {
          _id: '$workshops',
          count: { $sum: 1 }
        }
      }
    ]);

    const workerMap = new Map(workerCounts.map(item => [item._id.toString(), item.count]));
    const pictogramMap = new Map(
      pictogramCounts.map(item => [item._id.toString(), item.count])
    );

    res.json(
      workshops.map(workshop => ({
        ...workshop.toJSON(),
        workerCount: workerMap.get(workshop._id.toString()) || 0,
        pictogramCount: pictogramMap.get(workshop._id.toString()) || 0
      }))
    );
  })
);

router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const workshop = await Workshop.findOne(resolveWorkshopFilter(req.params.id));

    if (!workshop) {
      throw httpError(404, 'Atelier introuvable.');
    }

    if (
      req.user.role === 'worker' &&
      (!req.user.assignedWorkshop ||
        req.user.assignedWorkshop.toString() !== workshop._id.toString())
    ) {
      throw httpError(403, 'Accès refusé à cet atelier.');
    }

    res.json(workshop);
  })
);

router.post(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const { key, name, description, color, icon, isActive = true } = req.body;

    if (!key || !name) {
      throw httpError(400, "Clé et nom d'atelier requis.");
    }

    const existing = await Workshop.findOne({ key: key.toLowerCase().trim() });
    if (existing) {
      throw httpError(409, 'Cet atelier existe déjà.');
    }

    const workshop = await Workshop.create({
      key,
      name,
      description,
      color,
      icon,
      isActive
    });

    res.status(201).json(workshop);
  })
);

router.put(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const workshop = await Workshop.findOne(resolveWorkshopFilter(req.params.id));

    if (!workshop) {
      throw httpError(404, 'Atelier introuvable.');
    }

    const { key, name, description, color, icon, isActive } = req.body;

    if (key !== undefined) {
      workshop.key = key;
    }
    if (name !== undefined) {
      workshop.name = name;
    }
    if (description !== undefined) {
      workshop.description = description;
    }
    if (color !== undefined) {
      workshop.color = color;
    }
    if (icon !== undefined) {
      workshop.icon = icon;
    }
    if (isActive !== undefined) {
      workshop.isActive = Boolean(isActive);
    }

    await workshop.save();
    res.json(workshop);
  })
);

router.delete(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const workshop = await Workshop.findOne(resolveWorkshopFilter(req.params.id));

    if (!workshop) {
      throw httpError(404, 'Atelier introuvable.');
    }

    await User.updateMany(
      { assignedWorkshop: workshop._id },
      { $set: { assignedWorkshop: null } }
    );
    await Pictogram.updateMany(
      { workshops: workshop._id },
      { $pull: { workshops: workshop._id } }
    );
    await workshop.deleteOne();

    res.status(204).send();
  })
);

module.exports = router;
