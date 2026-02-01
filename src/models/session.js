// src/models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    duration: {
        type: Number,
        required: true,
        min: [1, 'Duration must be at least 1 minute']
    },
    type: {
        type: String,
        enum: ['pomodoro', 'shortBreak', 'longBreak'],
        required: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
    // In a real app, you'd add: userId: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Session', SessionSchema);