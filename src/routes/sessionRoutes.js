const express = require('express');
const { logSession } = require('../controllers/sessionController');
const router = express.Router();

router.route('/')
    .post(logSession); // POST /api/v1/sessions

module.exports = router;