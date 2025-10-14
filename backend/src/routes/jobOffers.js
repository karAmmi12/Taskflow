const express = require('express');
const {
    getJobOffers,
    updateJobOfferStatus,
    processAlert,
    getOfferStats,
    deleteJobOffer,
} = require('../controllers/jobOfferController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

router.get('/', getJobOffers);
router.get('/stats', getOfferStats);
router.put('/:id/status', updateJobOfferStatus);
router.post('/process/:alertId', processAlert);
router.delete('/:id', deleteJobOffer);

module.exports = router;