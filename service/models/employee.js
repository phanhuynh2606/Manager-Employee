const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'department',
    },
    position: {
      type: String,
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 1000,
      min: 0
    },
    hireDate: {
      type: Date,
      required: true
    },
    avatarUrl: {
      type: String,
      default: '/assets/images/avatar-default.png'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    leaveBalance: {
      annual: {
        type: Number,
        default: 12
      },
      sick: {
        type: Number,
        default: 10
      },
      unpaid: {
        type: Number,
        default: 0
      }
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('employee', employeeSchema);
