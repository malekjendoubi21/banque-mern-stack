const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/verifyToken');

// Inscription & Connexion
router.post('/register-client', authController.registerClient);
router.post('/register-admin', authController.registerAdmin);

router.post('/login-client', authController.loginClient);
router.post('/login-admin', authController.loginAdmin);

// Profils protégés
router.get('/profile-client', authMiddleware(['client']), authController.getProfileClient);
router.get('/profile-admin', authMiddleware(['admin']), authController.getProfileAdmin);

// Mot de passe oublié
router.post('/forgot-password-client', authController.forgotPasswordClient);
router.post('/forgot-password-admin', authController.forgotPasswordAdmin);

module.exports = router;
