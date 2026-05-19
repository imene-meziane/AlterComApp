const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const categorySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    prompt: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#6c9f8e'
    },
    icon: {
      type: String,
      default: ''
    },
    visibleFor: [
      {
        type: String,
        enum: ['worker', 'supervisor']
      }
    ],
    order: {
      type: Number,
      default: 0
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Category', categorySchema);
