const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ruta za dohvatanje profila korisnika
router.get('/', authenticateToken, profileController.getProfile);

// Ruta za ažuriranje profila korisnika
router.post('/edit', authenticateToken, profileController.upload.single('cv'), profileController.updateProfile);

module.exports = router;
