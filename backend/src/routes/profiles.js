const express = require('express');
const {
    getProfile,
    updateProfile
} = require('../controllers/profileController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;