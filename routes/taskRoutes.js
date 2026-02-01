import express from 'express';
import { getTasks, addTask, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All task routes protected
router.route('/').get(getTasks).post(addTask);
router.route('/:id').put(updateTask);

export default router;