const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const jwt = require('jsonwebtoken');

// Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'suman' && password === 'sumankumar10') {
    const token = jwt.sign({ role: 'admin', user: username }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.use(requireAdmin);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Movies
router.get('/movies', adminController.getMovies);
router.post('/movies', adminController.createMovie);
router.put('/movies/:id', adminController.updateMovie);
router.delete('/movies/:id', adminController.deleteMovie);

// Sliders
router.get('/sliders', adminController.getSliders);
router.post('/sliders', adminController.createSlider);
router.put('/sliders/:id', adminController.updateSlider);
router.delete('/sliders/:id', adminController.deleteSlider);

// Social Media
router.get('/socials', adminController.getSocialMedia);
router.post('/socials', adminController.createSocialMedia);
router.put('/socials/:id', adminController.updateSocialMedia);
router.delete('/socials/:id', adminController.deleteSocialMedia);

// Channels (bot listener channels)
router.get('/channels', adminController.getChannels);
router.post('/channels', adminController.createChannel);
router.put('/channels/:id', adminController.updateChannel);
router.delete('/channels/:id', adminController.deleteChannel);

// Bulk re-categorize movies based on registered channel sourceChannelId
router.post('/recategorize', adminController.recategorizeMovies);

// Dashboard stats
router.get('/stats', adminController.getStats);

module.exports = router;
