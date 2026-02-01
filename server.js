import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/db.js';
import taskRoutes from './routes/taskRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); 
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/sessions', sessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server secured on port ${PORT}`));