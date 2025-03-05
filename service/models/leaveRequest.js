const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const leaveRequestSchema = new Schema({
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    leaveType: {
      type: String,
      enum: ['ANNUAL', 'SICK', 'UNPAID', 'OTHER'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    adminNote: {
      type: String
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    }
  }, {
    timestamps: true
  });
  leaveRequestSchema.pre('save', function(next) {
    if (this.startDate > this.endDate) {
      const err = new Error('Ngày bắt đầu không thể sau ngày kết thúc');
      return next(err);
    }
    next();
  });
  
module.exports = mongoose.model('leaveRequest', leaveRequestSchema, 'leave_request');