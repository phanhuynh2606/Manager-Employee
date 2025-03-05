const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const backupSchema = new Schema({
    filename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

module.exports = mongoose.model('backup', backupSchema);