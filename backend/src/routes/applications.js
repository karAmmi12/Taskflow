const express = require('express');
const {
    getApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplicationStats
} = require('../controllers/applicationController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

router.get('/', getApplications);
router.get('/stats', getApplicationStats);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

module.exports = router;