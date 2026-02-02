import Session from '../models/session.js';

// @desc    Log a completed Pomodoro/Break session
// @route   POST /api/v1/sessions
// @access  Private
export const logSession = async (req, res, next) => {
    try {
        const { duration, type } = req.body;

        // 1. Manual validation check (Supplementing Mongoose Schema)
        if (!duration || !type) {
            res.status(400);
            throw new Error('Please provide session duration and type');
        }

        // 2. Create session linked to the authenticated user
        const session = await Session.create({
            duration,
            type,
            user: req.user.id
        });

        // 3. Standardized Logging
        console.log(`[${new Date().toISOString()}] INFO: Session Logged | User: ${req.user.id} | Type: ${type}`);

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        // 4. Pass error to Global Error Handler (middleware/errorMiddleware.js)
        next(error);
    }
};

// @desc    Get session history for the logged-in user (Bonus/Standard)
// @route   GET /api/v1/sessions
// @access  Private
export const getUserSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ user: req.user.id }).sort({ completedAt: -1 });
        
        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        next(error);
    }
};