import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../utlis/api';
import ClientLayout from '../../components/common/ClientLayout';
import { useTheme } from '../../contexts/ThemeContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [userData, setUserData] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/client/login');
                    return;
                }

                const userResponse = await API.get('auth/profile-client');
                setUserData(userResponse.data);

                const accountsResponse = await API.get('/comptes/mes-comptes');
                const userAccounts = accountsResponse.data;
                setAccounts(userAccounts);

                // Récupérer toutes les transactions
                const transactionsResponse = await API.get('/transactions');
                const allTransactions = transactionsResponse.data;
                
                // Filtrer les transactions pour ne garder que celles associées aux comptes du client
                const userAccountIds = userAccounts.map(account => account.idcompte);
                const userTransactions = allTransactions.filter(transaction => 
                    userAccountIds.includes(transaction.idcompte)
                );
                
                setTransactions(userTransactions);

                setLoading(false);
            } catch (err) {
                setError('Impossible de charger vos données. Veuillez vous reconnecter.');
                localStorage.removeItem('token');
                setLoading(false);
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/client/login');
    };    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 dark:from-red-900/20 dark:via-pink-900/20 dark:to-orange-900/20 p-6">
                <div className="notification notification-error glassmorphism mb-6 animate-error-shake">
                    <div className="flex items-center space-x-3">
                        <svg className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/client/login')}
                    className="btn-secondary animate-bounce-subtle hover:animate-pulse"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                    Retour à la connexion
                </button>
            </div>
        );
    }    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
                <div className="text-center">
                    <div className="loading-spinner mx-auto mb-6"></div>                    <p className="text-lg font-medium text-adaptive-secondary animate-pulse">
                        Chargement de vos données...
                    </p>
                    <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );}
      return (
        <ClientLayout>
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Bonjour, {userData?.prenom} {userData?.nom} 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Voici un aperçu de votre situation financière
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date().toLocaleDateString('fr-FR', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Solde Total</p>
                            <p className="text-2xl font-bold mt-2">
                                {accounts.reduce((acc, account) => acc + parseFloat(account.solde), 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Mes Comptes</p>
                            <p className="text-2xl font-bold mt-2">{accounts.length}</p>
                            <p className="text-green-100 text-xs mt-1">comptes actifs</p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Mes Transactions</p>
                            <p className="text-2xl font-bold mt-2">{transactions.length}</p>
                            <p className="text-purple-100 text-xs mt-1">
                                {transactions.length === 0 ? 'Aucune transaction' : 
                                 transactions.length === 1 ? 'transaction' : 'transactions'}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-xl p-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">                {/* Mes Comptes */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                💳 Mes Comptes
                            </h3>
                            <Link 
                                to="/mes-comptes" 
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center group"
                            >
                                Voir tout 
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        
                        {accounts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun compte</h4>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Vous n'avez pas encore de compte bancaire</p>
                                <Link 
                                    to="/mes-comptes" 
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Ouvrir un compte
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {accounts.slice(0, 3).map((account, index) => (
                                    <Link 
                                        key={account.idcompte}
                                        to={`/account/${account.idcompte}`}
                                        className="block group"
                                    >
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-md">
                                                                {account.typecompte}
                                                            </span>
                                                        </div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            •••• {account.idcompte.slice(-4)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xl font-bold ${parseFloat(account.solde) < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                                                        {parseFloat(account.solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                                        Voir détails
                                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>                {/* Dernières Transactions */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 h-full">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            📊 Activité Récente
                        </h3>
                        
                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune transaction</h4>
                                <p className="text-gray-500 dark:text-gray-400">Vos transactions apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.slice(0, 5).map((transaction, index) => (
                                    <div key={transaction.idtransaction} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            parseFloat(transaction.montant) > 0
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                        }`}>
                                            {parseFloat(transaction.montant) > 0 ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {transaction.description || 'Transaction'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(transaction.datetransaction || transaction.date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${
                                                parseFloat(transaction.montant) > 0
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                            }`}>
                                                {parseFloat(transaction.montant) > 0 ? '+' : ''}
                                                {parseFloat(transaction.montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </p>
                                        </div>
                                    </div>                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Rapides */}
            <div className="mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        ⚡ Actions Rapides
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link 
                            to="/mes-comptes" 
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mes Comptes</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gérer vos comptes</p>
                        </Link>
                        
                        <Link 
                            to="/mes-comptes" 
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Virement</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Transférer de l'argent</p>
                        </Link>
                        
                        <Link 
                            to="/mes-comptes" 
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Transactions</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Voir l'historique</p>
                        </Link>
                        
                        <Link 
                            to="/client/profile" 
                            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mon Profil</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Gérer mes infos</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-8 mb-6">
                        <a href="/help" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                            Centre d'aide
                        </a>
                        <a href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                            Contact
                        </a>
                        <a href="/security" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                            Sécurité
                        </a>
                        <a href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                            CGU
                        </a>
                    </div>
                    <div className="flex items-center justify-center space-x-6 mb-4">
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-sm font-medium">100% Sécurisé</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Support 24/7</span>
                        </div>
                    </div>                    <p className="text-gray-500 dark:text-gray-400 text-sm">                        © 2025 BanqueOnline. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </ClientLayout>
    );
};

export default Dashboard;
