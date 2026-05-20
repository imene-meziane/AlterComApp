const express = require('express');
const mongoose = require('mongoose');

const Category = require('../models/Category');
const History = require('../models/History');
const Pictogram = require('../models/Pictogram');
const Routine = require('../models/Routine');
const User = require('../models/User');
const Workshop = require('../models/Workshop');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const router = express.Router();

async function resolveCategory(categoryValue) {
  if (!categoryValue) {
    return null;
  }

  const filter = mongoose.Types.ObjectId.isValid(categoryValue)
    ? { _id: categoryValue }
    : { key: String(categoryValue).toLowerCase().trim() };

  return Category.findOne(filter);
}

async function resolveWorkshop(workshopValue) {
  if (!workshopValue) {
    return null;
  }

  const filter = mongoose.Types.ObjectId.isValid(workshopValue)
    ? { _id: workshopValue }
    : { key: String(workshopValue).toLowerCase().trim() };

  return Workshop.findOne(filter);
}

async function buildSteps(steps = []) {
  return Promise.all(
    steps.map(async (step, index) => {
      let pictogramId = null;

      if (step.pictogram) {
        const pictogramFilter = mongoose.Types.ObjectId.isValid(step.pictogram)
          ? { _id: step.pictogram }
          : { key: step.pictogram };
        const pictogram = await Pictogram.findOne(pictogramFilter);
        pictogramId = pictogram ? pictogram._id : null;
      }

      return {
        title: step.title,
        instruction: step.instruction,
        pictogram: pictogramId,
        audioText: step.audioText || step.instruction,
        order: Number(step.order || index + 1)
      };
    })
  );
}

function buildAssignmentPayload(routineIds = []) {
  return routineIds.map(routineId => ({
    routine: routineId,
    status: 'assigned',
    currentStepIndex: 0,
    completedStepIndexes: [],
    lastStartedAt: null,
    lastCompletedAt: null
  }));
}

async function syncUserAssignments(routine, nextAssignedIds = []) {
  await User.updateMany(
    { 'routineAssignments.routine': routine._id },
    { $pull: { routineAssignments: { routine: routine._id } } }
  );

  if (!nextAssignedIds.length) {
    return;
  }

  const workers = await User.find({
    _id: { $in: nextAssignedIds }
  }).select('_id routineAssignments');

  await Promise.all(
    workers.map(worker => {
      worker.routineAssignments = [
        ...(worker.routineAssignments || []).filter(
          assignment => assignment.routine.toString() !== routine._id.toString()
        ),
        ...buildAssignmentPayload([routine._id])
      ];

      return worker.save();
    })
  );
}

async function populateRoutine(routineId) {
  return Routine.findById(routineId)
    .populate('category', 'key name color icon')
    .populate('workshop', 'key name color icon')
    .populate('createdBy', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName role avatar email')
    .populate('steps.pictogram', 'key label phrase imageUrl color');
}

function attachWorkerProgress(routine, worker) {
  const assignment = worker?.routineAssignments?.find(item => {
    return item.routine?.toString() === routine._id.toString();
  });

  const progress = assignment
    ? {
        status: assignment.status,
        currentStepIndex: assignment.currentStepIndex,
        completedStepIndexes: assignment.completedStepIndexes,
        progressPercent: routine.steps.length
          ? Math.round(
              (assignment.completedStepIndexes.length / routine.steps.length) * 100
            )
          : 0
      }
    : {
        status: 'assigned',
        currentStepIndex: 0,
        completedStepIndexes: [],
        progressPercent: 0
      };

  return {
    ...routine.toJSON(),
    assignment: progress
  };
}

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const filter = { isActive: true };

    if (req.user.role === 'worker') {
      filter.assignedTo = req.user._id;
    } else if (req.query.assignedTo) {
      filter.assignedTo = req.query.assignedTo;
    }

    if (req.query.category) {
      const category = await resolveCategory(req.query.category);
      if (!category) {
        res.json([]);
        return;
      }
      filter.category = category._id;
    }

    if (req.query.workshop) {
      const workshop = await resolveWorkshop(req.query.workshop);
      if (!workshop) {
        res.json([]);
        return;
      }
      filter.workshop = workshop._id;
    }

    const routines = await Routine.find(filter)
      .populate('category', 'key name color icon')
      .populate('workshop', 'key name color icon')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName role avatar email')
      .populate('steps.pictogram', 'key label phrase imageUrl color')
      .sort({ createdAt: -1 });

    if (req.user.role === 'worker') {
      const worker = await User.findById(req.user._id).select('routineAssignments');
      res.json(routines.map(routine => attachWorkerProgress(routine, worker)));
      return;
    }

    res.json(routines);
  })
);

router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const routine = await populateRoutine(req.params.id);

    if (!routine) {
      throw httpError(404, 'Routine introuvable.');
    }

    if (
      req.user.role === 'worker' &&
      !routine.assignedTo.some(worker => worker._id.equals(req.user._id))
    ) {
      throw httpError(403, 'Routine non accessible.');
    }

    if (req.user.role === 'worker') {
      const worker = await User.findById(req.user._id).select('routineAssignments');
      res.json(attachWorkerProgress(routine, worker));
      return;
    }

    res.json(routine);
  })
);

router.post(
  '/',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const {
      key,
      title,
      description,
      steps,
      assignedTo,
      category,
      workshop,
      estimatedMinutes,
      difficulty,
      supportText,
      isActive = true
    } = req.body;

    if (!key || !title || !category) {
      throw httpError(400, 'Clé, titre et catégorie sont requis.');
    }

    const existingRoutine = await Routine.findOne({
      key: String(key).toLowerCase().trim()
    });

    if (existingRoutine) {
      throw httpError(409, 'Cette routine existe déjà.');
    }

    const categoryDoc = await resolveCategory(category);
    if (!categoryDoc) {
      throw httpError(400, 'Catégorie invalide.');
    }

    const workshopDoc = await resolveWorkshop(workshop);

    const assignedWorkerIds = Array.isArray(assignedTo)
      ? assignedTo
      : assignedTo
        ? [assignedTo]
        : [];

    const normalizedSteps = await buildSteps(Array.isArray(steps) ? steps : []);

    const routine = await Routine.create({
      key,
      title,
      description,
      category: categoryDoc._id,
      workshop: workshopDoc?._id || null,
      createdBy: req.user._id,
      assignedTo: assignedWorkerIds,
      steps: normalizedSteps,
      estimatedMinutes: Number(estimatedMinutes || 10),
      difficulty: difficulty || 'facile',
      supportText: supportText || '',
      isActive: Boolean(isActive)
    });

    await syncUserAssignments(routine, assignedWorkerIds);

    const populated = await populateRoutine(routine._id);
    res.status(201).json(populated);
  })
);

router.put(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      throw httpError(404, 'Routine introuvable.');
    }

    const {
      key,
      title,
      description,
      steps,
      assignedTo,
      category,
      workshop,
      estimatedMinutes,
      difficulty,
      supportText,
      isActive
    } = req.body;

    if (key !== undefined) {
      routine.key = String(key).toLowerCase().trim();
    }
    if (title !== undefined) {
      routine.title = title;
    }
    if (description !== undefined) {
      routine.description = description;
    }
    if (category !== undefined) {
      const categoryDoc = await resolveCategory(category);
      if (!categoryDoc) {
        throw httpError(400, 'Catégorie invalide.');
      }
      routine.category = categoryDoc._id;
    }
    if (workshop !== undefined) {
      const workshopDoc = await resolveWorkshop(workshop);
      routine.workshop = workshopDoc?._id || null;
    }
    if (steps !== undefined) {
      routine.steps = await buildSteps(Array.isArray(steps) ? steps : []);
    }
    if (estimatedMinutes !== undefined) {
      routine.estimatedMinutes = Number(estimatedMinutes || 10);
    }
    if (difficulty !== undefined) {
      routine.difficulty = difficulty;
    }
    if (supportText !== undefined) {
      routine.supportText = supportText;
    }
    if (isActive !== undefined) {
      routine.isActive = Boolean(isActive);
    }

    if (assignedTo !== undefined) {
      const nextAssignedIds = Array.isArray(assignedTo)
        ? assignedTo
        : assignedTo
          ? [assignedTo]
          : [];

      routine.assignedTo = nextAssignedIds;
      await syncUserAssignments(routine, nextAssignedIds);
    }

    await routine.save();
    const populated = await populateRoutine(routine._id);
    res.json(populated);
  })
);

router.post(
  '/:id/progress',
  auth,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      throw httpError(404, 'Routine introuvable.');
    }

    const user = await User.findById(req.user._id);
    const assignment = user.routineAssignments.find(item => {
      return item.routine.toString() === routine._id.toString();
    });

    if (!assignment) {
      throw httpError(403, 'Routine non assignée.');
    }

    const stepIndex = Number(
      req.body.stepIndex !== undefined ? req.body.stepIndex : assignment.currentStepIndex
    );

    if (Number.isNaN(stepIndex) || stepIndex < 0 || stepIndex >= routine.steps.length) {
      throw httpError(400, 'Étape invalide.');
    }

    assignment.status = 'in_progress';
    assignment.lastStartedAt = assignment.lastStartedAt || new Date();

    if (!assignment.completedStepIndexes.includes(stepIndex)) {
      assignment.completedStepIndexes.push(stepIndex);
    }

    const uniqueCompleted = Array.from(new Set(assignment.completedStepIndexes)).sort(
      (left, right) => left - right
    );
    assignment.completedStepIndexes = uniqueCompleted;

    const nextStepIndex = Math.min(stepIndex + 1, routine.steps.length - 1);
    assignment.currentStepIndex = nextStepIndex;

    if (uniqueCompleted.length >= routine.steps.length) {
      assignment.status = 'completed';
      assignment.currentStepIndex = routine.steps.length - 1;
      assignment.lastCompletedAt = new Date();

      await History.create({
        worker: user._id,
        workshop: user.assignedWorkshop || routine.workshop || null,
        routine: routine._id,
        text: `Routine terminée : ${routine.title}`,
        channel: 'routine'
      });
    }

    await user.save();

    const populated = await populateRoutine(routine._id);
    res.json(attachWorkerProgress(populated, user));
  })
);

router.post(
  '/:id/reset',
  auth,
  authorize('worker'),
  asyncHandler(async (req, res) => {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      throw httpError(404, 'Routine introuvable.');
    }

    const user = await User.findById(req.user._id);
    const assignment = user.routineAssignments.find(item => {
      return item.routine.toString() === routine._id.toString();
    });

    if (!assignment) {
      throw httpError(403, 'Routine non assignée.');
    }

    assignment.status = 'assigned';
    assignment.currentStepIndex = 0;
    assignment.completedStepIndexes = [];
    assignment.lastStartedAt = null;
    assignment.lastCompletedAt = null;
    await user.save();

    const populated = await populateRoutine(routine._id);
    res.json(attachWorkerProgress(populated, user));
  })
);

router.delete(
  '/:id',
  auth,
  authorize('supervisor'),
  asyncHandler(async (req, res) => {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      throw httpError(404, 'Routine introuvable.');
    }

    await User.updateMany(
      { 'routineAssignments.routine': routine._id },
      { $pull: { routineAssignments: { routine: routine._id } } }
    );

    await routine.deleteOne();
    res.status(204).send();
  })
);

module.exports = router;
