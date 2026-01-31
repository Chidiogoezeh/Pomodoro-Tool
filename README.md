Pomodoro Timer, Full-Stack Application

This project is a fully functional Pomodoro Timer built using the MERN-adjacent stack: HTML, Vanilla CSS, Vanilla JavaScript for the front-end, and Node.js/Express with MongoDB for the back-end persistence.

Features

Customizable Timer Modes: Pomodoro (25 min), Short Break (5 min), and Long Break (15 min).
Session Tracking: Automatically logs completed Pomodoro sessions to the database.
Task Management: Basic CRUD functionality (Create/Read/Update) for managing tasks.
Mode Cycling: Automatically switches to a break after a Pomodoro session.
Persistent Data: Task lists and session history are saved in MongoDB.

Tech Stack

Component   Technology                      Role

Front-End   HTML, Vanilla CSS, Vanilla JS   User interface, timer logic, and API consumption.

Back-End    Node.js, Express.js             RESTful API creation, serving static files, and database communication.

Database    MongoDB (via Mongoose)          Persistent storage for tasks and Pomodoro session logs.

Development dotenv, nodemon, cors           Configuration, auto-reloading, and Cross-Origin Resource Sharing.

Getting Started

Follow these steps to get the application running on your local machine.
1. Prerequisites
You must have the following installed:
Node.js (LTS version recommended)
npm (comes with Node.js)
Access to a MongoDB instance (local or cloud-based like MongoDB Atlas).

2. Installation
Clone the repository:
git clone [Your Repository URL Here] pomodoro-app
cd pomodoro-app

Install back-end dependencies:
npm install

3. Configuration
Create Environment File:In the root directory of the project, create a file named .env.

Add Configuration Variables:Populate the .env file with your specific environment details:
PORT=3000
# Replace the placeholders with your actual MongoDB connection string
MONGO_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/<dbname>?retryWrites=true&w=majority"

4. Running the App
Start the server:
npm run dev
# Alternatively, for production: npm start

The server will start on the configured port (default: 3000). You should see messages confirming the database connection and server status.
Access the App:Open your web browser and navigate to:
http://localhost:3000


Project Structure

The application follows a standard Node.js project structure, separating static assets from server logic.pomodoro-app/
├── node_modules/         
├── .env                  
├── package.json          
├── server.js             # Express app entry point, connecting middleware and routes
|
├── public/               # Client-Side Assets (HTML, CSS, Vanilla JS)
│   ├── index.html        # Main application structure
│   ├── style.css         # Styling
│   └── script.js         # Core timer logic and API interactions
|
└── src/                  # Server-Side Logic
    ├── config/           # Database configuration
    │   └── db.js         # MongoDB connection (Mongoose)
    |
    ├── controllers/      # Business logic and request handling
    │   ├── taskController.js    
    │   └── sessionController.js 
    |
    ├── models/           # Mongoose Schemas (Database structure)
    │   ├── Task.js       
    │   └── Session.js    
    |
    └── routes/           # API Endpoint Definitions
        ├── taskRoutes.js    
        └── sessionRoutes.js 

Security Considerations

This blueprint includes basic security, but for a production-ready application, consider adding:
Authentication: Implement User Registration/Login using JWT (JSON Web Tokens) or session management.
Input Validation: Use libraries like express-validator to ensure all incoming data conforms to expected formats and prevents injection attacks.
Security Headers: Use the helmet middleware in server.js to secure HTTP headers.
CORS Restriction: Restrict the cors() settings in server.js to explicitly allow only your front-end domain.
