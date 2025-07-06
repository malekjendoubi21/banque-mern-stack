import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import API from '../../utlis/api';
import ClientLayout from '../../components/common/ClientLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeService from '../../services/stripeService';
import './RechargeAnimation.css';

const stripePromise = loadStripe('pk_test_51RBMki4NCECvuRy85Ev8DO6gdHf7QFBSi2pkSwpPS5mjcuQjxqDjnRuw3jeB0nfvfxkMD8HWrc9jkV79nmJgpm5l00RojlUKNH'); // Remplace par ta clé publique Stripe

// Composant pour le formulaire de recharge avec Stripe Checkout
const RechargeForm = ({ onClose, compte, onSuccess, onStripePayment }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        setError('');

        // Validation du montant
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Veuillez entrer un montant valide.');
            setLoading(false);
            return;
        }

        try {
            // Utiliser Stripe Checkout pour le paiement
            await onStripePayment(
                compte.idcompte,
                amount
            );
            
            // Note: onSuccess sera appelé par le callback de redirection après le paiement
            // Ferme le modal puisque l'utilisateur sera redirigé vers Stripe
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue lors de la recharge.');
            setLoading(false);
        }
    };
      return (
        <div className="modal-body">
            <div className="modal-header">
                <h3 className="modal-title">Recharger le compte</h3>
            </div>
            
            <div className="p-6">
                <div className="glass p-4 rounded-xl mb-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-semibold">Compte:</span> {compte.typecompte || compte.type}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Solde actuel:</span>{' '}
                        <span className="text-gradient font-bold">
                            {parseFloat(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </p>
                </div>

                {error && (
                    <div className="notification danger mb-4 animate-shake">
                        <div className="toast-message">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label-modern">
                            Montant à recharger (€)
                        </label>
                        <div className="input-with-icon">
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="input-modern pl-10"
                                placeholder="50"
                                step="0.01"
                                min="1"
                                required
                            />
                        </div>
                        {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                            <div className="notification success mt-3 animate-slide-down">
                                <div className="toast-message">
                                    Nouveau solde après recharge:{' '}
                                    <span className="font-bold">
                                        {(parseFloat(compte.solde) + parseFloat(amount)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="glass p-4 rounded-xl mb-6">
                        <div className="flex items-center">
                            <div className="stat-card-icon mr-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    En cliquant sur "Procéder au paiement", vous serez redirigé vers l'interface sécurisée de Stripe pour effectuer votre paiement.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-accent"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="spinner mr-2"></div>
                                    Traitement...
                                </div>
                            ) : (                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Procéder au paiement
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Composant pour le formulaire de virement
const VirementForm = ({ 
    onClose, 
    compteSource, 
    virementData, 
    onInputChange, 
    destinataireInfo, 
    searchingDestinataire, 
    onSubmit, 
    loading, 
    error 
}) => {
    return (
        <div className="modal-body">
            <div className="modal-header">
                <h3 className="modal-title">Effectuer un virement</h3>
            </div>
            
            <div className="p-6">
                {/* Informations du compte source */}
                <div className="glass p-4 rounded-xl mb-6">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Compte source</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-semibold">Compte:</span> {compteSource.typecompte || compteSource.type}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <span className="font-semibold">N°:</span> {compteSource.idcompte}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Solde disponible:</span>{' '}
                        <span className="text-gradient font-bold">
                            {parseFloat(compteSource.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </p>
                </div>

                {error && (
                    <div className="notification danger mb-4 animate-shake">
                        <div className="toast-message">{error}</div>
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    {/* Numéro de compte destinataire */}
                    <div className="form-group mb-4">
                        <label className="label-modern">
                            Numéro de compte destinataire *
                        </label>
                        <div className="input-with-icon">
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="compteDestination"
                                value={virementData.compteDestination}
                                onChange={onInputChange}
                                className="input-modern pl-10"
                                placeholder="Ex: 12345"
                                required
                            />
                            {searchingDestinataire && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="spinner"></div>
                                </div>
                            )}
                        </div>
                        
                        {/* Affichage des informations du destinataire */}
                        {destinataireInfo && (
                            <div className="notification success mt-3 animate-slide-down">
                                <div className="flex items-center">
                                    <div className="stat-card-icon mr-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="toast-title">Destinataire trouvé</p>
                                        <p className="toast-message">
                                            {destinataireInfo.nom} {destinataireInfo.prenom}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Compte: {destinataireInfo.typecompte}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Montant */}
                    <div className="form-group mb-4">
                        <label className="label-modern">
                            Montant à virer (€) *
                        </label>
                        <div className="input-with-icon">
                            <div className="input-icon">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <input
                                type="number"
                                name="montant"
                                value={virementData.montant}
                                onChange={onInputChange}
                                className="input-modern pl-10"
                                placeholder="100"
                                step="0.01"
                                min="0.01"
                                max={parseFloat(compteSource.solde)}
                                required
                            />
                        </div>
                        {virementData.montant && !isNaN(parseFloat(virementData.montant)) && parseFloat(virementData.montant) > 0 && (
                            <div className="notification info mt-3 animate-slide-down">
                                <div className="toast-message">
                                    Nouveau solde après virement:{' '}
                                    <span className="font-bold">
                                        {(parseFloat(compteSource.solde) - parseFloat(virementData.montant)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-group mb-6">
                        <label className="label-modern">
                            Description (optionnel)
                        </label>
                        <textarea
                            name="description"
                            value={virementData.description}
                            onChange={onInputChange}
                            className="input-modern"
                            placeholder="Motif du virement..."
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Informations de sécurité */}
                    <div className="glass p-4 rounded-xl mb-6">
                        <div className="flex items-center">
                            <div className="stat-card-icon mr-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Vérifiez attentivement les informations du destinataire avant de confirmer le virement. Cette opération sera immédiate et irréversible.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !destinataireInfo || !virementData.montant}
                            className="btn-accent"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="spinner mr-2"></div>
                                    Traitement...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Confirmer le virement
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MesComptes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { darkMode } = useTheme();
    const [comptes, setComptes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        typecompte: '',
        solde: ''
    });    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);
      // Nouveaux états pour la recharge
    const [showRechargeModal, setShowRechargeModal] = useState(false);
    const [selectedCompte, setSelectedCompte] = useState(null);
    const [rechargeSuccess, setRechargeSuccess] = useState(false);
    
    // Nouveaux états pour le virement
    const [showVirementModal, setShowVirementModal] = useState(false);
    const [selectedCompteSource, setSelectedCompteSource] = useState(null);
    const [virementData, setVirementData] = useState({
        compteDestination: '',
        montant: '',
        description: ''
    });
    const [destinataireInfo, setDestinataireInfo] = useState(null);
    const [virementLoading, setVirementLoading] = useState(false);
    const [virementError, setVirementError] = useState('');
    const [virementSuccess, setVirementSuccess] = useState(false);
    const [searchingDestinataire, setSearchingDestinataire] = useState(false);
      // Fonction pour charger les comptes
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
    }, [navigate]);    /**
     * Met à jour manuellement le solde après un paiement Stripe réussi
     * Cette fonction est utilisée comme fallback si le webhook ne fonctionne pas
     */
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
    }, [fetchComptes]);    /**
     * Enregistre une transaction Stripe après une recharge réussie
     */
    const recordStripeTransaction = useCallback(async (compteId, amount, sessionId) => {
        try {
            console.log("Enregistrement de la transaction Stripe...");
            
            const transactionData = {
                type: 'stripe',
                montant: parseFloat(amount),
                description: `Recharge compte ${compteId} via Stripe - Session: ${sessionId}`,
                datetransaction: new Date(),
                idcompte: compteId // Ajouter l'idcompte pour la relation
            };

            const response = await API.post('/transactions', transactionData);
            console.log("Transaction Stripe enregistrée avec succès:", response.data);
            
            return response.data;
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la transaction Stripe:", error);
            throw error;
        }
    }, []);

    // Nettoyer les anciennes transactions traitées du sessionStorage
    useEffect(() => {
        const cleanOldTransactions = () => {
            const processedTransactions = sessionStorage.getItem('processedTransactions');
            if (processedTransactions) {
                const processed = JSON.parse(processedTransactions);
                // Garder seulement les 10 dernières transactions pour éviter l'accumulation
                if (processed.length > 10) {
                    const recentTransactions = processed.slice(-10);
                    sessionStorage.setItem('processedTransactions', JSON.stringify(recentTransactions));
                }
            }
        };

        cleanOldTransactions();
    }, []);

    // Charger les comptes au montage du composant
    useEffect(() => {
        fetchComptes();
    }, [fetchComptes]);    // Gestion du succès du paiement Stripe
    useEffect(() => {
        const success = searchParams.get('success');
        const canceled = searchParams.get('canceled');
        const sessionId = searchParams.get('session_id');
        const compteId = searchParams.get('compte_id');
        const amount = searchParams.get('amount');
        
        if (success === 'true' && sessionId && compteId && amount) {
            // Vérifier si cette transaction n'a pas déjà été traitée
            const processedTransactions = sessionStorage.getItem('processedTransactions');
            const processed = processedTransactions ? JSON.parse(processedTransactions) : [];
            
            if (!processed.includes(sessionId)) {
                // Marquer cette transaction comme traitée
                processed.push(sessionId);
                sessionStorage.setItem('processedTransactions', JSON.stringify(processed));
                
                // Afficher le message de succès
                setRechargeSuccess(true);
                setTimeout(() => setRechargeSuccess(false), 5000);
                
                // Mise à jour temporaire du solde côté client
                setComptes(currentComptes => 
                    currentComptes.map(compte => 
                        compte.idcompte === compteId 
                            ? { ...compte, solde: (parseFloat(compte.solde) + parseFloat(amount)).toFixed(2) } 
                            : compte
                    )
                );
                
                // Enregistrer la transaction Stripe dans la base de données
                recordStripeTransaction(compteId, amount, sessionId).catch(error => {
                    console.error("Erreur lors de l'enregistrement de la transaction:", error);
                });
                
                // Essayer de mettre à jour le solde manuellement en cas d'échec du webhook
                updateBalanceManually(compteId, amount, sessionId);
                
                // Rafraîchir les comptes pour voir le nouveau solde (après un délai)
                setTimeout(() => fetchComptes(), 2000);
            }
            
            // Nettoyer l'URL en supprimant les paramètres
            navigate('/mes-comptes', { replace: true });
        } else if (canceled === 'true') {
            // Afficher un message d'annulation (optionnel)
            console.log('Paiement annulé par l\'utilisateur');
            
            // Nettoyer l'URL en supprimant les paramètres
            navigate('/mes-comptes', { replace: true });
        }
    }, [searchParams, navigate, fetchComptes, updateBalanceManually, recordStripeTransaction]);
      // Fonction pour ouvrir le modal de recharge
    const handleOpenRechargeModal = (compte) => {
        setSelectedCompte(compte);
        setShowRechargeModal(true);
    };
    
    // Fonction pour ouvrir le modal de virement
    const handleOpenVirementModal = (compte) => {
        setSelectedCompteSource(compte);
        setShowVirementModal(true);
        setVirementData({
            compteDestination: '',
            montant: '',
            description: ''
        });
        setDestinataireInfo(null);
        setVirementError('');
    };
    
    // Fonction pour rechercher les informations du destinataire
    const searchDestinataire = async (numeroCompte) => {
        if (!numeroCompte || numeroCompte.length < 3) {
            setDestinataireInfo(null);
            return;
        }
        
        setSearchingDestinataire(true);
        try {
            const response = await API.get(`/comptes/search/${numeroCompte}`);
            setDestinataireInfo(response.data);
            setVirementError('');
        } catch (err) {
            setDestinataireInfo(null);
            if (err.response?.status === 404) {
                setVirementError('Compte non trouvé');
            } else {
                setVirementError('Erreur lors de la recherche du compte');
            }
        } finally {
            setSearchingDestinataire(false);
        }
    };
    
    // Fonction pour gérer les changements dans le formulaire de virement
    const handleVirementInputChange = (e) => {
        const { name, value } = e.target;
        setVirementData(prev => ({ ...prev, [name]: value }));
        
        // Rechercher le destinataire quand le numéro de compte change
        if (name === 'compteDestination') {
            searchDestinataire(value);
        }
    };
    
    // Fonction pour effectuer le virement
    const handleVirement = async (e) => {
        e.preventDefault();
        setVirementLoading(true);
        setVirementError('');
        
        // Validation
        if (!virementData.compteDestination || !virementData.montant) {
            setVirementError('Veuillez remplir tous les champs obligatoires');
            setVirementLoading(false);
            return;
        }
        
        if (!destinataireInfo) {
            setVirementError('Compte destinataire non valide');
            setVirementLoading(false);
            return;
        }
        
        const montant = parseFloat(virementData.montant);
        if (montant <= 0) {
            setVirementError('Le montant doit être positif');
            setVirementLoading(false);
            return;
        }
        
        if (montant > parseFloat(selectedCompteSource.solde)) {
            setVirementError('Solde insuffisant');
            setVirementLoading(false);
            return;
        }
        
        if (virementData.compteDestination === selectedCompteSource.idcompte.toString()) {
            setVirementError('Impossible de faire un virement vers le même compte');
            setVirementLoading(false);
            return;
        }
        
        try {
            // Effectuer le virement
            const virementPayload = {
                compteSource: selectedCompteSource.idcompte,
                compteDestination: virementData.compteDestination,
                montant: montant,
                description: virementData.description || `Virement vers ${destinataireInfo.nom} ${destinataireInfo.prenom}`
            };
            
            const response = await API.post('/virements', virementPayload);
            
            // Afficher le message de succès
            setVirementSuccess(true);
            setTimeout(() => setVirementSuccess(false), 5000);
            
            // Fermer le modal
            setShowVirementModal(false);
            
            // Rafraîchir les comptes
            fetchComptes();
            
        } catch (err) {
            setVirementError(err.response?.data?.message || 'Erreur lors du virement');
        } finally {
            setVirementLoading(false);
        }
    };// Fonction pour gérer le succès de la recharge
    const handleRechargeSuccess = () => {
        setRechargeSuccess(true);
        setTimeout(() => setRechargeSuccess(false), 3000);
        
        // Rafraîchir les données des comptes
        fetchComptes();
    };

    // Fonction pour soumettre le formulaire d'ajout de compte
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');

        try {
            await API.post('/comptes/creer', formData);
            setShowForm(false);
            setFormData({ typecompte: '', solde: '' });
            
            // Rafraîchir la liste des comptes
            const response = await API.get('/comptes/mes-comptes');
            setComptes(response.data);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Une erreur est survenue lors de la création du compte.');
        } finally {
            setFormLoading(false);
        }
    };

    // Fonction pour gérer les changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };    // Fonction pour initier le paiement Stripe
    const handleStripePayment = async (compteId, amount) => {
        try {
            const response = await StripeService.createCheckoutSession(compteId, amount);
            
            // Rediriger vers la page de paiement Stripe
            window.location.href = response.url;
        } catch (err) {
            throw new Error(err.message || 'Erreur lors de la création de la session de paiement');
        }
    };    return (
        <ClientLayout>
            {/* Gestion des états de chargement et d'erreur */}
            {loading && (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bank-primary"></div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">                        {/* Carte de bienvenue modernisée */}
                        <div className="lg:col-span-3">
                            <div className="card-premium text-white p-8 relative overflow-hidden animate-fade-in">
                                {/* Effet de fond décoratif avec morphing */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 morph-animation -translate-y-8 translate-x-8"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4 animate-float"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="animate-slide-up">
                                            <h2 className="text-3xl font-bold mb-2 text-gradient">Mes Comptes</h2>
                                            <p className="text-white/80 text-lg">Gérez tous vos comptes bancaires en toute simplicité</p>
                                        </div>
                                        <div className="hidden md:block animate-bounce-gentle">
                                            <div className="glass rounded-full p-4 animate-glow-pulse">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 grid-modern">
                                        <div className="stat-card glass border border-white/30 animate-slide-left">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Total de vos comptes</p>
                                                    <p className="text-3xl font-bold mt-2 animate-heartbeat">
                                                        {comptes.reduce((acc, account) => acc + parseFloat(account.solde), 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-white/30 animate-slide-down">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Nombre de comptes</p>
                                                    <p className="text-3xl font-bold mt-2">{comptes.length}</p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-white/30 animate-slide-right">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Date</p>
                                                    <p className="text-2xl font-bold mt-2">{new Date().toLocaleDateString('fr-FR')}</p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                {/* Liste de comptes modernisée */}
                <div className="lg:col-span-3">
                    <div className="card-modern p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gestion des comptes</h3>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={showForm ? "btn-danger" : "btn-primary"}
                            >
                                {showForm ? 'Annuler' : 'Ajouter un compte'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="mb-6 glass p-6 rounded-xl3 animate-slide-down">
                                {formError && (
                                    <div className="notification danger mb-4">
                                        <div className="toast-title">Erreur</div>
                                        <div className="toast-message">{formError}</div>
                                    </div>
                                )}
                                <div className="grid-modern gap-4">
                                    <div className="form-group">
                                        <label className="label-modern" htmlFor="typecompte">
                                            Type de compte
                                        </label>
                                        <input
                                            id="typecompte"
                                            name="typecompte"
                                            type="text"
                                            value={formData.typecompte}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="Exemple : Épargne"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label-modern" htmlFor="solde">
                                            Solde initial (€)
                                        </label>
                                        <input
                                            id="solde"
                                            name="solde"
                                            type="number"
                                            step="0.01"
                                            value={formData.solde}
                                            onChange={handleInputChange}
                                            className="input-modern"
                                            placeholder="1000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="btn-accent"
                                    >
                                        {formLoading ? (
                                            <div className="flex items-center">
                                                <div className="spinner mr-2"></div>
                                                Création...
                                            </div>
                                        ) : (
                                            'Créer le compte'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {comptes.length === 0 ? (
                            <div className="text-center py-8 animate-fade-in">
                                <div className="morph-animation w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Vous n'avez pas encore de compte</p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Créez votre premier compte pour commencer</p>
                            </div>
                        ) : (
                            <div className="grid-modern animate-fade-in">
                                {comptes.map((compte, index) => (
                                    <div
                                        key={compte.idcompte}
                                        className="card-glow p-6 parallax-card group cursor-pointer"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-semibold text-gradient">
                                                    {compte.typecompte || compte.type}
                                                </h3>
                                                <div className={`badge ${compte.etat === 'active' ? 'badge-success' : 'badge-warning'} animate-glow`}>
                                                    {compte.etat || 'Actif'}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                <span className="font-medium">N° :</span> {compte.idcompte}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                <span className="font-medium">Ouvert le :</span>{' '}
                                                {new Date(compte.datecreation).toLocaleDateString('fr-FR')}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <p className={`text-xl font-bold mb-3 ${parseFloat(compte.solde) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'} animate-heartbeat`}>
                                                    {parseFloat(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                </p>                                                <div className="flex space-x-2">
                                                    <Link 
                                                        to={`/account/${compte.idcompte}`}
                                                        className="btn-primary flex-1 text-center"
                                                    >
                                                        Détails
                                                    </Link>
                                                    {compte.etat === 'active' && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault(); 
                                                                    handleOpenRechargeModal(compte);
                                                                }}
                                                                className="btn-accent flex-1"
                                                            >
                                                                Recharger
                                                            </button>                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault(); 
                                                                    handleOpenVirementModal(compte);
                                                                }}
                                                                className="btn-outline flex-1"
                                                            >
                                                                Virement
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>            <footer className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-xl font-bold mb-4 flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                BanqueOnline
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                                Votre partenaire financier de confiance pour tous vos besoins bancaires. 
                                Sécurisé, moderne et toujours à votre service.
                            </p>
                        </div>
                        
                        <div>
                            <h5 className="font-bold mb-4 text-lg">Services</h5>
                            <div className="space-y-2">
                                <a href="/help" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Centre d'aide</a>
                                <a href="/contact" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Nous contacter</a>
                                <a href="/security" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Sécurité</a>
                            </div>
                        </div>
                        
                        <div>
                            <h5 className="font-bold mb-4 text-lg">Légal</h5>
                            <div className="space-y-2">
                                <a href="/terms" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Conditions générales</a>
                                <a href="/privacy" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Confidentialité</a>
                                <a href="/cookies" className="block text-gray-300 hover:text-blue-400 text-sm transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2025 BanqueOnline. Tous droits réservés.
                        </div>
                        <div className="flex space-x-6">
                            <div className="flex items-center space-x-2 text-green-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-sm font-medium">Sécurisé SSL</span>
                            </div>
                            <div className="flex items-center space-x-2 text-blue-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">24h/24 7j/7</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>{/* Modal de recharge modernisée */}
            {showRechargeModal && selectedCompte && (
                <div className="modal-overlay flex items-center justify-center">
                    <div className="modal-modern">
                        <Elements stripe={stripePromise}>
                            <RechargeForm 
                                onClose={() => setShowRechargeModal(false)} 
                                compte={selectedCompte} 
                                onSuccess={handleRechargeSuccess}
                                onStripePayment={handleStripePayment}
                            />
                        </Elements>
                    </div>
                </div>
            )}

            {/* Modal de virement */}
            {showVirementModal && selectedCompteSource && (
                <div className="modal-overlay flex items-center justify-center">
                    <div className="modal-modern">
                        <VirementForm 
                            onClose={() => setShowVirementModal(false)} 
                            compteSource={selectedCompteSource} 
                            virementData={virementData}
                            onInputChange={handleVirementInputChange}
                            destinataireInfo={destinataireInfo}
                            searchingDestinataire={searchingDestinataire}
                            onSubmit={handleVirement}
                            loading={virementLoading}
                            error={virementError}
                        />
                    </div>
                </div>
            )}

            {/* Message de succès modernisé */}
            {rechargeSuccess && (
                <div className="notification success animate-notification-in">
                    <div className="flex items-center">
                        <div className="stat-card-icon mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="toast-title">Recharge effectuée !</p>
                            <p className="toast-message">Transaction enregistrée avec succès</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message de succès pour virement */}
            {virementSuccess && (
                <div className="notification success animate-notification-in">
                    <div className="flex items-center">
                        <div className="stat-card-icon mr-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <div>
                            <p className="toast-title">Virement effectué !</p>
                            <p className="toast-message">Transaction enregistrée avec succès</p>
                        </div>
                    </div>
                </div>
            )}
                </>
            )}
        </ClientLayout>
    );
};

export default MesComptes;
