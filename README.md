Pomodoro Timer
A full-stack productivity tool built with Node.js, Express, and MongoDB, featuring secure user authentication, persistent task management, and automated session logging.

Key Features
Secure Authentication: User registration and login powered by JWT (JSON Web Tokens) and bcryptjs password hashing.

Production Security: Integrated Helmet.js for secure HTTP headers and strictly configured CORS policies.

Smart Timer: Automated cycling between Pomodoro (25m), Short Break (5m), and Long Break (15m) modes.

Validated Data: Strict input validation using express-validator to prevent XSS and Injection attacks.

Task Management: Private, user-specific task lists with persistent database storage.

Tech Stack

Component,  Technology,                             Role

Front-End,  "HTML5, Vanilla CSS, ES6 JavaScript",   Zero-dependency UI; secure DOM manipulation (No innerHTML).

Back-End,   Node.js (ES6 Modules),                  Modular API architecture with secure routing.

Security,   "JWT, Bcrypt, Helmet, Express-Validator",Protects user data and prevents common web vulnerabilities.

Database,   MongoDB & Mongoose,                     "Document-based storage for Users, Tasks, and Sessions."

Project Structure
The src folder has been removed in favor of a clean, root-level modular architecture:

pomodoro-tool/
├── config/             # DB Connection & Passport settings
├── controllers/        # Business logic (Auth, Tasks, Sessions)
├── middleware/         # JWT Protection & Validation logic
├── models/             # Mongoose Schemas (User, Task, Session)
├── public/             # Static Assets
│   ├── css/            # Vanilla CSS (Modern UI)
│   ├── js/             # ES6 Logic (authUi.js, script.js)
│   ├── login.html      # Authentication Page
│   └── index.html      # Protected App UI
├── routes/             # API Endpoint definitions
├── .env                # Secrets & Configuration
├── server.js           # Production entry point
└── package.json        # Dependencies & ES6 Module config

Installation & Setup
1. Prerequisites
Node.js (v18.0.0+ recommended)

MongoDB (Local instance or Atlas Cluster)

2. Installation

git clone https://github.com/Chidiogoezeh/Pomodoro-Tool.git
cd pomodoro-app
npm install

3. Environment Configuration
Create a .env file in the root directory and populate it with the following:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5000

4. Running the Application
Development (Auto-reload): npm run dev

Production: npm start

Access the app at http://localhost:5000.

Security Implementations
This application is built with a "Security First" mindset:

JWT Protection: All Task and Session routes require a valid Bearer token.

Password Hashing: Passwords are salted and hashed 10 times before database entry.

Data Sanitization: Mongoose Schemas and Express-Validator ensure no malicious scripts enter the DB.

No Inline Scripts: Following strict Content Security Policy (CSP) guidelines.
