const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const notificationSchema = new Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['SYSTEM', 'DEPARTMENT', 'PERSONAL'],
      required: true
    },
    departmentId:[
      {
        type: Schema.Types.ObjectId,
        ref: 'Department',
      }
    ],
    recipientId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
      }
    ],
    readBy: [{
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }, {
    timestamps: true,
    // Chỉ cần createdAt, không cần updatedAt
    updatedAt: false
  });

module.exports = mongoose.model('notification', notificationSchema);