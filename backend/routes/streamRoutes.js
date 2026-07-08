const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

router.get('/:telegramFileId', streamController.streamVideo);

module.exports = router;
