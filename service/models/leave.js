const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveRequestSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'employee', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'], default: 'Chờ duyệt' }
});

module.exports = mongoose.model('leave', leaveRequestSchema);
