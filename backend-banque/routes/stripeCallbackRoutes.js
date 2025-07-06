const express = require('express');
const router = express.Router();
const { Compte } = require('../models');

// Route de mise à jour de solde après paiement Stripe réussi
router.post('/update-balance', async (req, res) => {
    try {
        const { compteId, amount, sessionId } = req.body;
        
        if (!compteId || !amount || !sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Paramètres manquants: compteId, amount et sessionId sont requis' 
            });
        }

        // Trouver le compte
        const compte = await Compte.findOne({ 
            where: { idcompte: compteId } 
        });

        if (!compte) {
            return res.status(404).json({ 
                success: false, 
                message: 'Compte non trouvé' 
            });
        }

        // Mettre à jour le solde
        compte.solde = parseFloat(compte.solde) + parseFloat(amount);
        await compte.save();

        console.log(`Solde du compte ${compteId} mis à jour manuellement: +${amount}€`);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Solde mis à jour avec succès',
            newBalance: compte.solde
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du solde:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour du solde',
            error: error.message
        });
    }
});

module.exports = router;
