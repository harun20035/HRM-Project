const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const interviewsController = require('../controllers/interviewsController');

// Rute za prikazivanje intervjua
router.get('/', authenticateToken, interviewsController.getInterviews);

// Ruta za zakazivanje intervjua (admini i super admini)
router.post('/schedule', authenticateToken, authorizeRole(['super_admin', 'admin']), interviewsController.scheduleInterview);

// Ruta za ažuriranje statusa aplikacije (admini i super admini)
router.put('/:applicationId/status', authenticateToken, authorizeRole(['super_admin', 'admin']), interviewsController.updateApplicationStatus);

// Potvrda intervjua
router.put('/:interviewId/confirm', authenticateToken, authorizeRole(['user']), interviewsController.confirmInterview);

// Odbijanje intervjua
router.put('/:interviewId/decline', authenticateToken, authorizeRole(['user']), interviewsController.declineInterview);

module.exports = router;