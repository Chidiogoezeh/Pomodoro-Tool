import Task from '../models/task.js';

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

export const addTask = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user.id) {
            return res.status(404).json({ success: false, error: 'Not authorized' });
        }
        task.isCompleted = req.body.isCompleted;
        await task.save();
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};