const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const activityLogSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
    },
    action: {
      type: String, 
      required: true
    },
    entityType: {
      type: String,
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    oldValues: {
      type: Object
    },
    newValues: {
      type: Object
    },
    ipAddress: {
      type: String
    }
  }, {
    timestamps: true, 
    updatedAt: false
  });

module.exports = mongoose.model('log', activityLogSchema, 'activity_logs');