const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'employee',
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
        enum: ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'EARLY_LEAVE'],
        required: true
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0
    },
    morningHours: {
        type: Number,
        default: 0
    },
    afternoonHours: {
        type: Number,
        default: 0
    },
    breakHours: {
        type: Number,
        default: 0
    },
    lateMinutes: {
        type: Number,
        default: 0
    },
    earlyLeaveMinutes: {
        type: Number,
        default: 0
    },
    note: {
      type: String
    }
  }, {
    timestamps: true
  });
  // Tạo index compound unique để đảm bảo mỗi nhân viên chỉ có một bản ghi chấm công mỗi ngày
  attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('attendance', attendanceSchema);
