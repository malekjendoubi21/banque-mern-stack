// Copier ce code et l'insérer dans MesComptes.js en respectant l'ordre approprié

// La fonction fetchComptes avec useCallback (à placer près du début du composant)
const fetchComptes = useCallback(async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/client/login');
            return;
        }

        const response = await API.get('/comptes/mes-comptes');
        setComptes(response.data);
        setLoading(false);
    } catch (err) {
        setError('Impossible de charger vos comptes.');
        setLoading(false);
        if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('token');
            setTimeout(() => navigate('/client/login'), 2000);
        }
    }
}, [navigate]);

// La fonction updateBalanceManually avec useCallback (à placer après fetchComptes)
const updateBalanceManually = useCallback(async (compteId, amount, sessionId) => {
    try {
        console.log("Tentative de mise à jour manuelle du solde...");
        const result = await StripeService.updateBalanceAfterPayment(compteId, amount, sessionId);
        
        if (result.success) {
            console.log("Mise à jour manuelle du solde réussie:", result.newBalance);
            // Rafraîchir les comptes pour afficher le nouveau solde
            fetchComptes();
        } else {
            console.warn("Échec de la mise à jour manuelle:", result.message);
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour manuelle:", error);
    }
}, [fetchComptes]);

// Le hook useEffect pour gérer le retour de Stripe (à placer après les deux fonctions ci-dessus)
useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');
    const compteId = searchParams.get('compte_id');
    const amount = searchParams.get('amount');
    
    if (success === 'true' && sessionId && compteId && amount) {
        // Afficher le message de succès
        setRechargeSuccess(true);
        setTimeout(() => setRechargeSuccess(false), 5000);
        
        // Mise à jour temporaire du solde côté client
        // Cela permet d'afficher le nouveau solde immédiatement, même si le webhook n'a pas encore été traité
        setComptes(currentComptes => 
            currentComptes.map(compte => 
                compte.idcompte === compteId 
                    ? { ...compte, solde: (parseFloat(compte.solde) + parseFloat(amount)).toFixed(2) } 
                    : compte
            )
        );
        
        // Essayer de mettre à jour le solde manuellement en cas d'échec du webhook
        updateBalanceManually(compteId, amount, sessionId);
        
        // Rafraîchir les comptes pour voir le nouveau solde (après un délai pour laisser le temps au webhook)
        setTimeout(() => fetchComptes(), 2000);
        
        // Nettoyer l'URL en supprimant les paramètres
        navigate('/mes-comptes', { replace: true });
    } else if (canceled === 'true') {
        // Afficher un message d'annulation (optionnel)
        console.log('Paiement annulé par l\'utilisateur');
        
        // Nettoyer l'URL en supprimant les paramètres
        navigate('/mes-comptes', { replace: true });
    }
}, [searchParams, navigate, fetchComptes, updateBalanceManually]);

// La fonction handleStripePayment (à placer plus loin dans le composant)
const handleStripePayment = async (compteId, amount) => {
    try {
        const response = await StripeService.createCheckoutSession(compteId, amount);
        
        // Rediriger vers la page de paiement Stripe
        window.location.href = response.url;
    } catch (err) {
        throw new Error(err.message || 'Erreur lors de la création de la session de paiement');
    }
};
