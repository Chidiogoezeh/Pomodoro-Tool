import express from 'express';
import { logSession } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, logSession);

export default router;