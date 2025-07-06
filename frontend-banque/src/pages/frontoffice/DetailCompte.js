// src/pages/frontoffice/DetailCompte.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utlis/api';
import ClientLayout from '../../components/common/ClientLayout';
import { useTheme } from '../../contexts/ThemeContext';

const DetailCompte = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [compte, setCompte] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [transactionFilter, setTransactionFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [error, setError] = useState('');
    const [transactionsError, setTransactionsError] = useState('');

    // Fonction pour charger les détails du compte
    const fetchCompte = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/client/login');
                return;
            }

            const response = await API.get(`/comptes/${id}`);
            setCompte(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger le compte. Veuillez réessayer.');
            setLoading(false);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('token');
                setTimeout(() => navigate('/client/login'), 2000);
            }
        }
    }, [id, navigate]);    // Fonction pour charger les transactions du compte
    const fetchTransactions = useCallback(async () => {
        try {
            setTransactionsLoading(true);
            // Utiliser la route spécifique pour les transactions d'un compte
            const response = await API.get(`/transactions/compte/${id}`);
            
            console.log('Transactions reçues:', response.data); // Debug
            
            setTransactions(response.data);
            setTransactionsLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement des transactions:', err);
            setTransactionsError('Impossible de charger les transactions.');
            setTransactionsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCompte();
        fetchTransactions();
    }, [fetchCompte, fetchTransactions]);

    // Fonction pour exporter les transactions en CSV
    const exportTransactionsToCSV = () => {
        if (filteredTransactions.length === 0) {
            alert('Aucune transaction à exporter');
            return;
        }

        const headers = ['Date', 'Type', 'Montant', 'Description'];
        const csvContent = [
            headers.join(','),
            ...filteredTransactions.map(t => [
                new Date(t.datetransaction).toLocaleDateString('fr-FR'),
                formatTransactionType(t.type),
                t.montant,
                `"${(t.description || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${compte?.idcompte}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    // Fonction pour formater le type de transaction
    const formatTransactionType = (type) => {
        const types = {
            'stripe': 'Recharge Stripe',
            'virement': 'Virement',
            'virement_debit': 'Virement envoyé',
            'virement_credit': 'Virement reçu',
            'depot': 'Dépôt',
            'retrait': 'Retrait',
            'frais': 'Frais bancaire',
            'interets': 'Intérêts'
        };
        return types[type] || type;
    };    // Fonction pour extraire le compte source d'un virement depuis la description
    const extractSourceAccount = (description, type) => {
        if (!description) return null;
        
        console.log('Extraction pour:', { type, description }); // Debug
        
        // Pour les virements reçus, extraire le compte source
        if (type === 'virement_credit') {
            // Format attendu: "Virement reçu de [Nom Prénom] ([compte_source])"
            const match = description.match(/\(([^)]+)\)$/);
            if (match) {
                console.log('Compte source trouvé:', match[1]); // Debug
                return match[1]; // Retourne le contenu entre parenthèses
            }
        }
        
        // Pour les virements envoyés, extraire le compte destination
        if (type === 'virement_debit') {
            // Format attendu: "Virement vers [Nom Prénom] ([compte_destination])"
            const match = description.match(/\(([^)]+)\)$/);
            if (match) {
                console.log('Compte destination trouvé:', match[1]); // Debug
                return match[1]; // Retourne le contenu entre parenthèses
            }
        }
        
        // Fallback pour l'ancien format "virement" générique
        if (type === 'virement') {
            const match = description.match(/\(([^)]+)\)$/);
            if (match) {
                return match[1];
            }
        }
        
        console.log('Aucun compte trouvé pour:', { type, description }); // Debug
        return null;
    };

    // Fonction pour obtenir la couleur selon le type de transaction
    const getTransactionColor = (type, montant) => {
        if (type === 'stripe' || type === 'depot' || parseFloat(montant) > 0) {
            return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
        }
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
    };

    // Fonction pour obtenir l'icône selon le type de transaction
    const getTransactionIcon = (type, montant) => {
        if (type === 'stripe' || type === 'depot' || parseFloat(montant) > 0) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
        );
    };    // Fonction pour filtrer les transactions selon le type sélectionné
    const filterTransactions = useCallback((filterType) => {
        if (filterType === 'all') {
            setFilteredTransactions(transactions);
        } else if (filterType === 'positive') {
            setFilteredTransactions(transactions.filter(t => parseFloat(t.montant) > 0));
        } else if (filterType === 'negative') {
            setFilteredTransactions(transactions.filter(t => parseFloat(t.montant) < 0));
        } else if (filterType === 'virement') {
            // Filtre pour tous les types de virements
            setFilteredTransactions(transactions.filter(t => 
                t.type === 'virement' || 
                t.type === 'virement_credit' || 
                t.type === 'virement_debit'
            ));
        } else {
            setFilteredTransactions(transactions.filter(t => t.type === filterType));
        }
    }, [transactions]);

    // Effet pour filtrer les transactions quand elles changent ou que le filtre change
    useEffect(() => {
        filterTransactions(transactionFilter);
    }, [transactions, transactionFilter, filterTransactions]);

    return (
        <ClientLayout>
            {/* Gestion des états de chargement et d'erreur */}
            {loading && (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-bank-primary"></div>
                </div>
            )}

            {error && (
                <div className="notification danger mb-6 animate-shake">
                    <div className="toast-message">{error}</div>
                </div>
            )}{!loading && !error && compte && (
                <>
                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Carte de détails du compte modernisée */}
                        <div className="lg:col-span-3">
                            <div className="card-premium text-white p-8 relative overflow-hidden animate-fade-in">
                                {/* Effet de fond décoratif avec morphing */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 morph-animation -translate-y-8 translate-x-8"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-4 -translate-x-4 animate-float"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="animate-slide-up">
                                            <h2 className="text-3xl font-bold mb-2 text-gradient">Détails du Compte</h2>
                                            <p className="text-white/80 text-lg">{compte.typecompte}</p>
                                        </div>
                                        <div className="hidden md:block animate-bounce-gentle">
                                            <div className="glass rounded-full p-4 animate-glow-pulse">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>                                    <div className="mt-8 grid-modern">
                                        <div className="stat-card glass border border-white/30 animate-slide-left">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Numéro de compte</p>
                                                    <p className="text-xl font-bold mt-2 break-all">{compte.idcompte}</p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-white/30 animate-slide-down">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Solde actuel</p>
                                                    <p className="text-3xl font-bold mt-2 animate-heartbeat">
                                                        {parseFloat(compte.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-white/30 animate-slide-up">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Statut</p>
                                                    <div className="flex items-center mt-2">
                                                        <div className={`badge ${compte.etat === 'active' ? 'badge-success' : 'badge-warning'} animate-glow mr-3`}>
                                                            {compte.etat || 'Actif'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-white/30 animate-slide-right">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Date de création</p>
                                                    <p className="text-xl font-bold mt-2">
                                                        {new Date(compte.datecreation).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <div className="stat-card-icon">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>                                
                                {/* Statistiques des transactions modernisées */}
                                {transactions.length > 0 && (
                                    <div className="mt-8 grid-modern animate-fade-in">
                                        <div className="stat-card glass border border-green-300/30 animate-pulse-glow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Total reçu</p>
                                                    <p className="text-2xl font-bold mt-2 text-green-300">
                                                        {transactions
                                                            .filter(t => parseFloat(t.montant) > 0)
                                                            .reduce((sum, t) => sum + parseFloat(t.montant), 0)
                                                            .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                </div>
                                                <div className="stat-card-icon bg-green-500/20">
                                                    <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-red-300/30 animate-pulse-glow" style={{ animationDelay: '0.2s' }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Total dépensé</p>
                                                    <p className="text-2xl font-bold mt-2 text-red-300">
                                                        {Math.abs(transactions
                                                            .filter(t => parseFloat(t.montant) < 0)
                                                            .reduce((sum, t) => sum + parseFloat(t.montant), 0))
                                                            .toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                </div>
                                                <div className="stat-card-icon bg-red-500/20">
                                                    <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="stat-card glass border border-blue-300/30 animate-pulse-glow" style={{ animationDelay: '0.4s' }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white/80 text-sm font-medium">Nb transactions</p>
                                                    <p className="text-2xl font-bold mt-2 text-blue-300">{transactions.length}</p>
                                                </div>
                                                <div className="stat-card-icon bg-blue-500/20">
                                                    <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>                        {/* Section des transactions modernisée */}
                        <div className="lg:col-span-3">
                            <div className="card-modern p-6 animate-slide-up">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                        Historique des transactions
                                    </h3>
                                    <div className="flex items-center space-x-4">                                        <select
                                            value={transactionFilter}
                                            onChange={(e) => setTransactionFilter(e.target.value)}
                                            className="px-3 py-1 border rounded bg-white dark:bg-gray-700 dark:text-white text-sm"
                                        >
                                            <option value="all">Toutes</option>
                                            <option value="positive">Entrées (+)</option>
                                            <option value="negative">Sorties (-)</option>
                                            <option value="stripe">Stripe</option>
                                            <option value="virement">Virements (tous)</option>
                                            <option value="virement_credit">Virements reçus</option>
                                            <option value="virement_debit">Virements envoyés</option>
                                            <option value="depot">Dépôts</option>
                                            <option value="retrait">Retraits</option>
                                        </select><span className="text-sm text-gray-600 dark:text-gray-400">
                                            {filteredTransactions.length} transaction(s)
                                        </span>
                                        <button
                                            onClick={exportTransactionsToCSV}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                                            disabled={filteredTransactions.length === 0}
                                        >
                                            Exporter CSV
                                        </button>
                                        <button
                                            onClick={fetchTransactions}
                                            className="px-3 py-1 bg-bank-primary text-white rounded text-sm hover:bg-bank-secondary transition"
                                            disabled={transactionsLoading}
                                        >
                                            {transactionsLoading ? 'Actualisation...' : 'Actualiser'}
                                        </button>
                                    </div>
                                </div>

                                {transactionsError && (
                                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
                                        {transactionsError}
                                    </div>
                                )}

                                {transactionsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bank-primary"></div>
                                    </div>
                                ) : filteredTransactions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>                                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                                            {transactions.length === 0 ? 'Aucune transaction trouvée' : 'Aucune transaction pour ce filtre'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500">
                                            {transactions.length === 0 ? 'Les transactions apparaîtront ici une fois effectuées' : 'Essayez un autre filtre'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredTransactions.map((transaction) => (
                                            <div
                                                key={transaction.idtransaction}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                            >                                                <div className="flex items-center space-x-4">
                                                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-600">
                                                        {getTransactionIcon(transaction.type, transaction.montant)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                                            {formatTransactionType(transaction.type)}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            {new Date(transaction.datetransaction).toLocaleDateString('fr-FR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {transaction.description && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 max-w-md">
                                                                {transaction.description}
                                                            </p>
                                                        )}                                                        {/* Affichage du compte source/destination pour les virements */}
                                                        {(transaction.type === 'virement_credit' || transaction.type === 'virement_debit' || transaction.type === 'virement') && (
                                                            <div className="mt-2">
                                                                {extractSourceAccount(transaction.description, transaction.type) ? (
                                                                    <div className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                                        </svg>
                                                                        {transaction.type === 'virement_credit' ? 'De: ' : 
                                                                         transaction.type === 'virement_debit' ? 'Vers: ' : 
                                                                         'Compte: '}
                                                                        {extractSourceAccount(transaction.description, transaction.type)}
                                                                    </div>
                                                                ) : (
                                                                    // Badge de débogage si aucun compte n'est trouvé
                                                                    <div className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                                        </svg>
                                                                        Format non reconnu
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div><div className="text-right">
                                                    <p className={parseFloat(transaction.montant) > 0 ? 'text-lg font-bold text-green-600 dark:text-green-400' : 'text-lg font-bold text-red-600 dark:text-red-400'}>
                                                        {parseFloat(transaction.montant) > 0 ? '+' : ''}
                                                        {parseFloat(transaction.montant).toLocaleString('fr-FR', { 
                                                            style: 'currency', 
                                                            currency: 'EUR' 
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                                        ID: {transaction.idtransaction}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bouton de retour */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                <Link
                                    to="/mes-comptes"
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Retour à mes comptes
                                </Link>
                            </div>
                        </div>
                    </div>

                    <footer className="bg-bank-primary text-bank-accent p-6 text-center text-sm select-none mt-6">
                        <div className="mb-3 space-x-6">
                            <a href="/help" className="hover:underline">Aide</a>
                            <a href="/contact" className="hover:underline">Contact</a>
                            <a href="/terms" className="hover:underline">Conditions générales</a>
                            <a href="/privacy" className="hover:underline">Confidentialité</a>
                        </div>
                        <div>© 2025 BanqueOnline. Tous droits réservés.</div>
                    </footer>
                </>
            )}
        </ClientLayout>
    );
};

export default DetailCompte;