const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'employee'
    },
    deleted: {
      type: Boolean,
      default: false
    },
    createBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('department', departmentSchema);
