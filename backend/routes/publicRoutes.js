const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const streamController = require('../controllers/streamController');

router.get('/home', publicController.getHomeData);
router.get('/movies', publicController.getMovies);
router.get('/movies/:id', publicController.getMovie);
router.get('/thumb/:telegramFileId', streamController.getThumbnail);
router.get('/categories/:categoryId/movies', publicController.getCategoryMovies);

module.exports = router;
