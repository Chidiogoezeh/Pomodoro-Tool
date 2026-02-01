// src/controllers/sessionController.js
const Session = require('../models/session');

// @desc    Log a completed Pomodoro session
// @route   POST /api/v1/sessions
exports.logSession = async (req, res) => {
    try {
        // Expected body: { duration: 25, type: 'pomodoro' }
        const session = await Session.create(req.body);
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        // Handle validation errors (e.g., invalid 'type' enum)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};