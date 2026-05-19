const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const pictogramSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    label: {
      type: String,
      required: true,
      trim: true
    },
    phrase: {
      type: String,
      required: true
    },
    spokenText: {
      type: String,
      default: ''
    },
    builderText: {
      type: String,
      default: ''
    },
    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    workshops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop'
      }
    ],
    // imageUrl kept for backward compatibility (remote URL)
    imageUrl: {
      type: String,
      required: false
    },
    // new fields to manage trusted sources and local assets
    source: {
      type: String,
      enum: ['arasaac', 'sclera', 'local'],
      required: true,
      default: 'arasaac'
    },
    sourceId: {
      type: String,
      default: null
    },
    filePath: {
      // relative path under frontend/public e.g. /pictograms/arasaac/1234.svg
      type: String,
      default: null
    },
    color: {
      type: String,
      default: '#6c9f8e'
    },
    sourceLabel: {
      type: String,
      default: 'Inspire FALC / ARASAAC'
    },
    showInSimplified: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Pictogram', pictogramSchema);
