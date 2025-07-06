import API from '../utlis/api';

/**
 * Service pour gérer les opérations liées à Stripe
 */
const StripeService = {
    /**
     * Crée une session de paiement Stripe Checkout
     * @param {string} compteId - L'identifiant du compte à recharger
     * @param {number} amount - Le montant de la recharge
     * @returns {Promise<Object>} - La réponse contenant l'URL de redirection Stripe
     */
    createCheckoutSession: async (compteId, amount) => {
        try {
            const response = await API.post('/comptes/create-checkout-session', {
                compteId,
                amount
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Erreur lors de la création de la session de paiement');
        }
    },

    /**
     * Met à jour manuellement le solde d'un compte après un paiement Stripe réussi
     * Cette fonction est utilisée comme fallback si le webhook ne fonctionne pas
     * @param {string} compteId - L'identifiant du compte
     * @param {number} amount - Le montant à ajouter au solde
     * @param {string} sessionId - L'identifiant de la session Stripe
     * @returns {Promise<Object>} - La réponse avec le statut de la mise à jour
     */
    updateBalanceAfterPayment: async (compteId, amount, sessionId) => {
        try {
            const response = await API.post('/stripe-callback/update-balance', {
                compteId,
                amount,
                sessionId
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour manuelle du solde:', error);
            // Ne pas propager l'erreur pour éviter de bloquer l'expérience utilisateur
            return { 
                success: false, 
                message: error.response?.data?.message || 'Erreur lors de la mise à jour du solde'
            };
        }
    }
};

export default StripeService;
