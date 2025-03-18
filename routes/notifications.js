const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const notificationsController = require('../controllers/notificationsController');

// Ruta za prikaz notifikacija korisnicima
router.get('/', authenticateToken, notificationsController.getNotifications);

// Ruta za slanje notifikacija od strane admina ili super admina
router.post('/', authenticateToken, authorizeRole(['admin', 'super_admin']), notificationsController.sendNotification);

// Ruta za dohvaćanje poslanih notifikacija
router.get('/sent', authenticateToken, authorizeRole(['admin', 'super_admin']), notificationsController.getSentNotifications);

module.exports = router;