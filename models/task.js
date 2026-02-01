// src/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'A task description is required'],
        trim: true,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // In a real app, you'd add: userId: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Task', TaskSchema);