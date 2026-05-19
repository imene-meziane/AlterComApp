const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const schemaOptions = require('../utils/schemaOptions');

const routineAssignmentSchema = new mongoose.Schema(
  {
    routine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed'],
      default: 'assigned'
    },
    currentStepIndex: {
      type: Number,
      default: 0
    },
    completedStepIndexes: [
      {
        type: Number
      }
    ],
    lastStartedAt: {
      type: Date,
      default: null
    },
    lastCompletedAt: {
      type: Date,
      default: null
    }
  },
  {
    _id: false
  }
);

const sessionSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['worker', 'supervisor'],
      default: 'worker'
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    simplificationLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'high'
    },
    supportNeeds: [
      {
        type: String,
        trim: true
      }
    ],
    assignedWorkshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop'
    },
    routineAssignments: [routineAssignmentSchema],
    preferences: {
      displayMode: {
        type: String,
        enum: ['simplified', 'complete'],
        default: 'simplified'
      },
      speechRate: {
        type: Number,
        default: 0.95
      },
      speechVolume: {
        type: Number,
        default: 1
      },
      showSearch: {
        type: Boolean,
        default: false
      },
      textScale: {
        type: String,
        enum: ['standard', 'large', 'xlarge'],
        default: 'large'
      },
      contrastMode: {
        type: String,
        enum: ['standard', 'high'],
        default: 'standard'
      },
      animationMode: {
        type: String,
        enum: ['calm', 'reduced'],
        default: 'calm'
      }
    },
    sessions: [sessionSchema],
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  schemaOptions
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
