const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const positionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('position', positionSchema);
