// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Essential for client-server communication
const connectDB = require('./src/config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// --- Security & Middleware ---

// Enable CORS for all requests (important for development/simple apps)
// In production, configure this strictly to only allow your front-end domain
app.use(cors());

// Body parser: allows the server to read JSON data from the request body
app.use(express.json());

// Serving static files (HTML, CSS, JS) from the 'public' folder
app.use(express.static('public'));

// --- Routes ---
const taskRoutes = require('./src/routes/taskRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');

// Mount routes
// API base path: /api/v1
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/sessions', sessionRoutes);

// Simple root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});