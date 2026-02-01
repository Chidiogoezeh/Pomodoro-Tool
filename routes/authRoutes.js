import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
], registerUser);

router.post('/login', loginUser);

export default router;