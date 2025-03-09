const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  },
  role: {
    type: String,
    enum: ['ADMIN', 'EMPLOYEE'],
    required: true
  },
  isActive: {
    type: String,
    default: '0'
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'employee'
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true  
});

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('user', userSchema);