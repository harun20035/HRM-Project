const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const applicationsStatusController = require('../controllers/applicationsStatusController');

// Ruta za prikaz statusa aplikacija
router.get('/', authenticateToken, authorizeRole(['super_admin', 'admin']), applicationsStatusController.getApplicationsStatus);

// Ruta za ažuriranje statusa aplikacija
router.put('/:applicationId/status', authenticateToken, authorizeRole(['super_admin', 'admin']), applicationsStatusController.updateApplicationStatus);


module.exports = router;
