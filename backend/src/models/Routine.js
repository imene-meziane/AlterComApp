const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const stepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    instruction: {
      type: String,
      required: true
    },
    pictogram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pictogram'
    },
    audioText: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const routineSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    steps: [stepSchema],
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    estimatedMinutes: {
      type: Number,
      default: 10
    },
    difficulty: {
      type: String,
      enum: ['facile', 'moyen', 'avance'],
      default: 'facile'
    },
    supportText: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Routine', routineSchema);
