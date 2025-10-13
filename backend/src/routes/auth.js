const express = require('express');
const { register,login, getProfile} = require('../controllers/authController');
const  authMiddleware  = require('../middleware/auth');

//creer un routeur express
const router = express.Router();

// routes publiques 
router.post('/register', register);
router.post('/login', login);

// route protégé
router.get('/profile', authMiddleware, getProfile);

module.exports = router;