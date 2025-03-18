const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Rute za korisnike
//router.get('/', applicationsController.getUserApplications);

router.get('/', applicationsController.getApplications);

// Rute za administratore
//router.get('/job/:jobId', authorizeRole(['super_admin', 'admin']), applicationsController.getJobApplications);
router.post('/job/:jobId/rank', authorizeRole(['super_admin', 'admin']), applicationsController.rankCandidate);
router.post('/job/:jobId/comment', authorizeRole(['super_admin', 'admin']), applicationsController.addComment);


module.exports = router;
