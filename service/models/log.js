const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const activityLogSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
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
    // Chỉ cần createdAt, không cần updatedAt
    updatedAt: false
  });

module.exports = mongoose.model('log', activityLogSchema, 'activity_logs');