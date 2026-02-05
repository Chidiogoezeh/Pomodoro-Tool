Pomodoro Tool

A professional, full-stack productivity application built with the MERN stack. This tool balances a "Security First" backend architecture with a seamless, zero-dependency frontend experience. It features persistent task management, automated session logging, and custom user-defined audio alerts.

Key Features

Secure Authentication: User registration and login powered by JWT (JSON Web Tokens) and bcryptjs password hashing.

Production Security: Hardened with Helmet.js to manage strict Content Security Policies (CSP) and secure HTTP headers.

Dynamic Timer: Customizable Focus and Break intervals with a togglable settings panel to minimize UI clutter.

Custom Audio Alerts: User-uploaded alarm sounds powered by the HTML5 File & Audio APIs; specifically engineered to bypass modern browser autoplay restrictions.

Task Management: Private, user-specific task lists with persistent storage and a "Clear Completed" utility.

Zero innerHTML: Strictly adheres to secure DOM manipulation practices to prevent XSS.

Tech Stack

Component,  Technology,                     Role

Front-End,  "HTML5, Vanilla CSS, ES6 JS",   Lightweight UI; secure DOM manipulation.

Back-End,   "Node.js, Express.js",          Modular API with secure routing & global error handling.

Security,   "JWT, Bcrypt, Helmet",          Protects user data and hardens HTTP headers.

Database,   MongoDB & Mongoose,             "Persistent storage for Users, Tasks, and Sessions."


Project Structure

The project follows a clean, root-level modular architecture to ensure scalability and ease of maintenance:

pomodoro-tool/
├── controllers/         # Business logic (Auth, Tasks, Sessions)
├── middleware/          # JWT Protection, Validation, & Helmet CSP config
├── models/              # Mongoose Schemas (User, Task, Session)
├── public/              # Static Assets
│   ├── css/             # Modern Vanilla CSS with Grid & Flexbox
│   ├── js/              # ES6 Logic (authUi.js, script.js)
│   └── index.html       # Single Page Application Dashboard
├── routes/              # API Endpoint definitions
├── server.js            # Production entry point & Security Middleware
└── .env                 # Secrets & Environment Configuration

Security and The Audio Challenge

One of the most significant technical hurdles in this project was implementing User-Uploaded Audio while maintaining a strict Content Security Policy (CSP).

Audio Priming: To bypass browser autoplay blocks, the application uses an "Audio Priming" technique. The audio context is "unlocked" via a user gesture (clicking the Start button), allowing the alarm to trigger automatically when the timer expires.

CSP Configuration: The backend is specifically configured via Helmet.js to allow blob: and data: URIs, enabling users to play local files without compromising the overall security of the application.

Data Integrity: All inputs are sanitized; passwords are salted/hashed 10 times; and API responses follow a standardized JSON format.


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

API Endpoints

Auth

POST /api/v1/auth/register - Register a new user.

POST /api/v1/auth/login - Login & receive JWT.

Tasks
GET /api/v1/tasks - Fetch user-specific tasks.

POST /api/v1/tasks - Create a task.

DELETE /api/v1/tasks/:id - Remove a task.

Sessions
POST /api/v1/sessions - Log focus/break completion.

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