const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const historySchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      default: null
    },
    text: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      enum: ['message', 'emergency', 'routine', 'emotion', 'alert'],
      default: 'message'
    }
  },
  schemaOptions
);

module.exports = mongoose.model('History', historySchema);
