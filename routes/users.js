express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Rute za pristup korisnicima
router.get('/', authorizeRole(['super_admin', 'admin']), usersController.getAllUsers);

// Postavljanje uloga samo za super admina
router.post('/', authorizeRole(['super_admin']), usersController.setRoles);

// Kreiranje korisnika - dostupno za admina
router.post('/new-user', authorizeRole(['super_admin']), usersController.createUser);

// Ažuriranje i brisanje korisnika - samo za super admina
router.put('/:id', authorizeRole(['super_admin']), usersController.updateUser);
router.delete('/:id', authorizeRole(['super_admin']), usersController.deleteUser);

module.exports = router;