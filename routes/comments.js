const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // Ispravna putanja za authMiddleware
const commentsController = require('../controllers/commentsController');

// Ruta za prikazivanje svih komentara (super admin može videti sve, admin samo svoje)
router.get('/', authenticateToken, authorizeRole(['super_admin', 'admin', 'user']), commentsController.getComments);

// Ruta za kreiranje komentara
router.post('/', authenticateToken, authorizeRole(['super_admin', 'admin']), commentsController.createComment);

// Ruta za uređivanje komentara (samo admin ili super admin može uređivati)
router.put('/:id', authenticateToken, authorizeRole(['super_admin', 'admin']), commentsController.updateComment);

// Ruta za brisanje komentara (samo admin ili super admin može brisati)
router.delete('/:id', authenticateToken, authorizeRole(['super_admin', 'admin']), commentsController.deleteComment);

module.exports = router;
