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
    location: {
      type: String,
      trim: true
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }, {
    timestamps: true
  });

module.exports = mongoose.model('department', departmentSchema);