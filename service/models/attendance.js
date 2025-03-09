const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const attendanceSchema = new Schema({
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    checkIn: {
      type: Date
    },
    checkOut: {
      type: Date
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'],
      required: true
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0
    },
    note: {
      type: String
    }
  }, {
    timestamps: true
  });
   
  attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('attendance', attendanceSchema);