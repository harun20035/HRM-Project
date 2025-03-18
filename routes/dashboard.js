// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { dashboard } = require('../controllers/dashboardController');  // Uvozimo funkciju iz kontrolera
const { getStatistics } = require('../controllers/dashboardController');

// Zaštićena ruta za dashboard
router.get('/', authenticateToken, dashboard);  // Pozivamo funkciju iz kontrolera

router.get('/statistics', authenticateToken, getStatistics);

module.exports = router;
