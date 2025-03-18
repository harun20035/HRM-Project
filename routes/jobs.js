const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage }); 

router.use(authenticateToken);

// Dohvatanje svih poslova
router.get('/', jobsController.getAllJobs);

// Kreiranje novog posla (samo za admina i super admina)
router.post('/', authorizeRole(['super_admin', 'admin']), jobsController.createJob);

// Brisanje posla
router.delete('/:id', authorizeRole(['super_admin', 'admin']), jobsController.deleteJob);

// Arhiviranje posla
router.patch('/:id/archive', authorizeRole(['super_admin', 'admin']), jobsController.archiveJob);

// Prijava na posao
router.post('/:id/apply', jobsController.applyForJob);

// Otkazivanje prijave
router.delete('/:id/cancel', jobsController.cancelApplication);

// Stranica za popunjavanje dodatnih dokumenata
router.get('/:id/complete-application', jobsController.getCompleteApplicationPage);

// Podnošenje dodatnih dokumenata i apliciranje
//router.post('/:id/complete-application', jobsController.submitAdditionalDocuments);
router.post('/:id/complete-application', upload.fields([{ name: 'certificates', maxCount: 5 }]), jobsController.submitAdditionalDocuments);

module.exports = router;