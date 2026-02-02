import Task from '../models/task.js';

// @desc    Get all tasks for logged in user
// @route   GET /api/v1/tasks
export const getTasks = async (req, res, next) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: 1 });
        
        console.log(`[${new Date().toISOString()}] INFO: Tasks fetched for User: ${req.user.id}`);
        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new task
// @route   POST /api/v1/tasks
export const addTask = async (req, res, next) => {
    try {
        const { description } = req.body;

        if (!description) {
            res.status(400);
            throw new Error('Please add a task description');
        }

        const task = await Task.create({
            description,
            user: req.user.id
        });

        console.log(`[${new Date().toISOString()}] INFO: Task Created: ${task._id}`);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};

// @desc    Update task status
// @route   PUT /api/v1/tasks/:id
export const updateTask = async (req, res, next) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        // Make sure user owns the task
        if (task.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized to update this task');
        }

        task.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : task.isCompleted;
        await task.save();

        console.log(`[${new Date().toISOString()}] INFO: Task Updated: ${task._id}`);
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        next(error);
    }
};