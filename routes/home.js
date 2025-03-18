const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Ruta za početnu stranicu
router.get('/', homeController.getHomePage);

module.exports = router;