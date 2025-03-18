const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const bestCandidatesController = require('../controllers/bestCandidatesController');

// Ruta za prikaz najboljih kandidata
router.get('/', authenticateToken, authorizeRole(['admin', 'super_admin']), bestCandidatesController.getBestCandidates);

module.exports = router;
