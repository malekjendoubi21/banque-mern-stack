const express = require('express');
const router = express.Router();
const compteController = require('../controllers/compteController');
const authMiddleware = require('../middleware/verifyToken');

// Routes spécifiques d'abord
router.get('/dashboard-stats', authMiddleware(['admin']), compteController.getDashboardStats);
router.get('/mes-comptes', authMiddleware(['client']), compteController.getComptesDuClientConnecte);
router.get('/search/:numeroCompte', authMiddleware(['client']), compteController.searchCompteForVirement);
router.post('/create-checkout-session', authMiddleware(['client']), compteController.createCheckoutSession);
// La route pour le webhook est gérée directement dans index.js
router.post('/creer', authMiddleware(['client']), compteController.createCompte);

// Routes générales ensuite
router.get('/', compteController.getAllComptes);
router.get('/:id', compteController.getCompteById);
router.post('/', authMiddleware(['client']), compteController.createCompte);
router.put('/:id', compteController.updateCompte);
router.delete('/:id', compteController.deleteCompte);
router.put('/:id/etat', authMiddleware(['admin']), compteController.updateEtatCompte);
router.post('/recharger', compteController.rechargerCompte);

module.exports = router;
