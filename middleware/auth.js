import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Fetch user from DB and attach to the Request object
        // we use .select('-password') for security
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.status(401);
            return next(new Error('User no longer exists'));
        }

        // 4. Log the authorized access
        console.log(`[${new Date().toISOString()}] AUTH: User ${req.user.id} authorized`);
        
        next();
    } catch (err) {
        res.status(401);
        next(new Error('Not authorized, token failed'));
    }
};