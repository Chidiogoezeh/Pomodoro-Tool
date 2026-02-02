Pomodoro Tool

A professional, full-stack productivity application built with the MERN stack (MongoDB, Express, Node.js, and Vanilla JS). This tool features secure user authentication, persistent task management, and automated session logging to help users stay focused and track their progress.

Key Features

Secure Authentication: User registration and login powered by JWT (JSON Web Tokens) and bcryptjs password hashing.

Production Security: Integrated Helmet.js for secure HTTP headers and strictly configured CORS policies.

Smart Timer: Automated cycling between Pomodoro (25m), Short Break (5m), and Long Break (15m) modes.

Validated Data: Strict input validation using express-validator to prevent XSS and NoSQL Injection attacks.

Task Management: Private, user-specific task lists with persistent database storage (CRUD functionality).

Global Error Handling: Standardized API responses and logging with timestamps.

Tech Stack

Component,  Technology,                             Role

Front-End,  "HTML5, Vanilla CSS, ES6 JavaScript",   Zero-dependency UI; secure DOM manipulation (No innerHTML).

Back-End,   "Node.js (ES6 Modules), Express.js",    Modular API architecture with secure routing and global error handling.

Security,   "JWT, Bcrypt, Helmet, Express-Validator",Protects user data and prevents common web vulnerabilities (OWASP Top 10).

Database,   MongoDB & Mongoose,                     "Document-based storage for Users, Tasks, and Sessions."


Project Structure

The project follows a clean, root-level modular architecture to ensure scalability and ease of maintenance:

pomodoro-tool/

├── config/             # Database connection (Mongoose)

├── controllers/        # Business logic (Auth, Tasks, Sessions)

├── middleware/         # JWT Protection, Validation, & Error handling

├── models/             # Mongoose Schemas (User, Task, Session)

├── public/             # Static Assets (Client-Side)

│   ├── css/            # Modern Vanilla CSS

│   ├── js/             # ES6 Logic (authUi.js, script.js)

│   ├── login.html      # Authentication View

│   ├── register.html   # Registration View

│   ├── 404.html        # Custom Error View

│   └── index.html      # Protected Dashboard View

├── routes/             # API Endpoint definitions

├── .env                # Secrets & Environment Configuration

├── server.js           # Production entry point

└── package.json        # Dependencies & ES6 Module config

Installation & Setup

1. Prerequisites

Node.js (v18.0.0+ recommended)

MongoDB (Local instance or Atlas Cluster)

2. Installation

Clone the repository

git clone https://github.com/Chidiogoezeh/Pomodoro-Tool.git

Navigate into the directory

cd Pomodoro-Tool

Install dependencies

npm install

3. Environment Configuration

Create a .env file in the root directory and add the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5000
NODE_ENV=development

4. Running the Application

Development (with Nodemon): npm run dev

Production: npm start

Access the app at: http://localhost:5000

Security Implementations

This application is built with a Security First mindset:

JWT Protection: All Task and Session routes are private and require a valid Bearer token.

Password Hashing: Passwords are salted and hashed 10 times before storage.

Data Sanitization: Mongoose Schemas and Express-Validator ensure data integrity.

Global Error Handling: Prevents leaking sensitive server information in error stacks.

No Inline Scripts: Adheres to strict Content Security Policy (CSP) guidelines.

API Endpoints

Auth

POST /api/v1/auth/register - Register a new user.

POST /api/v1/auth/login - Login and receive a JWT.

Tasks

GET /api/v1/tasks - Get all tasks for the logged-in user.

POST /api/v1/tasks - Create a new task.

PUT /api/v1/tasks/:id - Update task completion status.

Sessions

POST /api/v1/sessions - Log a completed focus/break session.

Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

Code Style Guidelines:

Use ES6 Modules (import/export).

Ensure all new API endpoints follow the global error handling pattern (next(error)).

Maintain the current logging format for server-side actions.

Do not use inline styles or innerHTML for frontend updates.

License

Distributed under the MIT License.