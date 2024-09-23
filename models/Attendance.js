const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
