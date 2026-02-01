const Task = require('../models/task');

// @desc    Get all tasks
// @route   GET /api/v1/tasks
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: 1 });
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add a new task
// @route   POST /api/v1/tasks
exports.addTask = async (req, res) => {
    try {
        // Basic input sanitization happens via Mongoose Schema (trim, maxlength)
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        // Handle validation errors (e.g., missing description)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update task status (e.g., mark complete)
// @route   PUT /api/v1/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, error: 'No task found' });
        }
        
        // Only allow updating isCompleted status in this basic example
        task.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : task.isCompleted;

        await task.save();
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};