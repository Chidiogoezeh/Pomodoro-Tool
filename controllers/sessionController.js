import Session from '../models/session.js';

export const logSession = async (req, res) => {
    try {
        const session = await Session.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Validation Error' });
    }
};
