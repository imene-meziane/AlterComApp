const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const workshopSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: '#88a9d5'
    },
    icon: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Workshop', workshopSchema);
