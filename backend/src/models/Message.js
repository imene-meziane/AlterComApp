const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const messageItemSchema = new mongoose.Schema(
  {
    pictogram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pictogram'
    },
    label: {
      type: String,
      required: true
    },
    builderText: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#88a9d5'
    }
  },
  {
    _id: false
  }
);

const messageSchema = new mongoose.Schema(
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
    items: [messageItemSchema],
    text: {
      type: String,
      required: true
    },
    channel: {
      type: String,
      enum: ['message', 'emergency'],
      default: 'message'
    },
    status: {
      type: String,
      enum: ['sent'],
      default: 'sent'
    },
    speechRate: {
      type: Number,
      default: 1
    },
    speechVolume: {
      type: Number,
      default: 1
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Message', messageSchema);
