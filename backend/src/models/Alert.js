const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const alertSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'important'
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'seen', 'resolved'],
      default: 'pending'
    },
    responseNote: {
      type: String,
      default: ''
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Alert', alertSchema);
