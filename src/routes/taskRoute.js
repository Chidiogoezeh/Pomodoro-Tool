// src/routes/taskRoutes.js
const express = require('express');
const { getTasks, addTask, updateTask } = require('../controllers/taskController');
const router = express.Router();

router.route('/')
    .get(getTasks)    // GET /api/v1/tasks
    .post(addTask);   // POST /api/v1/tasks

router.route('/:id')
    .put(updateTask); // PUT /api/v1/tasks/:id

module.exports = router;