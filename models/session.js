import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true },
    type: { type: String, enum: ['pomodoro', 'shortBreak', 'longBreak'], required: true },
    completedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Session', SessionSchema);