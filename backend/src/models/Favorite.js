const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    kind: {
      type: String,
      enum: ['pictogram', 'phrase'],
      required: true
    },
    pictogram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pictogram'
    },
    pictograms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pictogram'
      }
    ],
    title: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  schemaOptions
);

module.exports = mongoose.model('Favorite', favoriteSchema);
