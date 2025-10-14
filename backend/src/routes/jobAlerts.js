const express = require('express');
const {
    getJobAlerts,
    createJobAlert,
    updateJobAlert,
    deleteJobAlert,
    getJobAlertStats,
} = require('../controllers/jobAlertController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

router.get('/', getJobAlerts);
router.get('/stats', getJobAlertStats);
router.post('/', createJobAlert);
router.put('/:id', updateJobAlert);
router.delete('/:id', deleteJobAlert);

module.exports = router;