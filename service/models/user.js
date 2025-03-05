const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'EMPLOYEE'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true  
});

module.exports = mongoose.model('user', userSchema);