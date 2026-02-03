import express from 'express';
import { 
    getTasks, 
    addTask, 
    updateTask, 
    deleteTask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect); 

// Chain GET and POST for the root path
router.route('/')
    .get(getTasks)
    .post(addTask);

// Chain PUT and DELETE for the specific task ID
router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

export default router;