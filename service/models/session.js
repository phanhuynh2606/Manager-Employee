const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const userSessionSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionData: {
      type: Object,
      default: {}
    },
    deviceInfo: {
      browser: String,
      os: String,
      isMobile: Boolean
    },
    lastAccessed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  userSessionSchema.pre('save', function(next) {
    if (this.isModified('sessionData') || this.isNew) {
      this.lastAccessed = Date.now();
    }
    next();
  });
module.exports = mongoose.model('session', userSessionSchema, 'user_session')