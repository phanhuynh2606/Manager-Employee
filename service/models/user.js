const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    // lowercase: true
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
    ref: 'Employee'
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
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
};

userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d"
  });
};
 
module.exports = mongoose.model('user', userSchema);