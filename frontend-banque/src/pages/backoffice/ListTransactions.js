import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utlis/api';
import './ListUsers.css';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// Composant d'icône simplifié
const Icon = ({ className, fallback, ...props }) => {
  return (
    <i className={className} {...props}></i>
  );
};

const ListTransactions = () => {
  const navigate = useNavigate();
  const { isDarkMode, sidebarOpen, fontAwesomeLoaded, toggleTheme, toggleSidebar } = useAdminTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [sortField, setSortField] = useState('dateTransfert');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage, setTransactionsPerPage] = useState(10);
  const [activeMenuItem, setActiveMenuItem] = useState('transactions');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  
  // États pour la carte de détails
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailCard, setShowDetailCard] = useState(false);

  // Menu items pour la sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-line', path: '/admin/dashboard', color: 'text-blue-600' },
    { id: 'users', label: 'Gestion Clients', icon: 'fas fa-users', path: '/admin/users', color: 'text-emerald-600' },
    { id: 'accounts', label: 'Comptes Bancaires', icon: 'fas fa-piggy-bank', path: '/admin/accounts', color: 'text-purple-600' },
    { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt', path: '/admin/transactions', color: 'text-orange-600' },
    { id: 'reports', label: 'Rapports', icon: 'fas fa-chart-bar', path: '/admin/reports', color: 'text-red-600' },
    { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt', path: '/admin/security', color: 'text-yellow-600' },
    { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog', path: '/admin/settings', color: 'text-gray-600' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  // Timer pour l'horloge
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // Récupérer la liste des transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Récupérer les transactions
        const response = await API.get('/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Récupérer les types de transactions
        const typesResponse = await API.get('/transactions/types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTransactionTypes(typesResponse.data);
        
        const formattedTransactions = response.data.map(transaction => {
          // Utiliser les données relationnelles du backend
          const compte = transaction.Compte;
          const client = compte?.Client;
          const admin = transaction.Administrateur;
          
          return {
            id: transaction.idtransaction,
            montant: transaction.montant,
            motif: transaction.description || 'Transaction',
            dateTransfert: transaction.datetransaction,
            etat: 'effectue', // Les transactions sont généralement effectuées
            type: transaction.type || 'transaction',
            compte: {
              idcompte: compte?.idcompte || 'N/A',
              typecompte: compte?.typecompte || 'N/A',
              solde: compte?.solde || 0
            },
            client: {
              nom: client?.nom || 'N/A',
              prenom: client?.prenom || 'N/A',
              email: client?.email || 'N/A'
            },
            administrateur: {
              nom: admin?.nom || null,
              prenom: admin?.prenom || null,
              email: admin?.email || null
            }
          };
        });
        
        setTransactions(formattedTransactions);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des transactions:', error);
        setError('Erreur lors du chargement des transactions');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);
  // Fonctions de tri et filtrage
  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.id.toString().includes(searchTerm) ||
        transaction.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.client.nom !== 'N/A' && 
         `${transaction.client.nom} ${transaction.client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        transaction.compte.idcompte.toString().toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesType;
    });
  };

  const getSortedTransactions = () => {
    const filtered = getFilteredTransactions();
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'montant') {
        comparison = a.montant - b.montant;
      } else if (sortField === 'dateTransfert') {
        comparison = new Date(a.dateTransfert) - new Date(b.dateTransfert);
      } else {
        comparison = a[sortField] > b[sortField] ? 1 : (a[sortField] < b[sortField] ? -1 : 0);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Fonction pour afficher les détails
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailCard(true);
  };

  const handleCloseCard = () => {
    setShowDetailCard(false);
    setSelectedTransaction(null);
  };

  // Formater le montant
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Obtenir le label d'état
  const getStatusLabel = (etat) => {
    switch(etat) {
      case 'en_attente':
        return 'En attente';
      case 'effectue':
        return 'Effectué';
      case 'rejete':
        return 'Rejeté';
      case 'annule':
        return 'Annulé';
      default:
        return etat;
    }
  };
  // Exporter les transactions
  const handleExportCSV = () => {
    const headers = ['ID', 'Montant', 'Motif', 'Date', 'Client', 'Compte', 'Type', 'État'];
    const csvContent = [
      headers.join(','),
      ...getSortedTransactions().map(transaction => [
        transaction.id,
        transaction.montant.toFixed(2),
        transaction.motif,
        new Date(transaction.dateTransfert).toLocaleDateString('fr-FR'),
        transaction.client.nom !== 'N/A' ? `${transaction.client.nom} ${transaction.client.prenom}` : 'N/A',
        transaction.compte.idcompte || 'N/A',
        transaction.type,
        getStatusLabel(transaction.etat)
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transactions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Afficher l'indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">Chargement des transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedTransactions = getSortedTransactions();
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = sortedTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Notification si Font Awesome ne charge pas */}
      {!fontAwesomeLoaded && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg z-50">
          <p className="text-sm">
            <Icon className="fas fa-exclamation-triangle" fallback="⚠️" /> 
            Les icônes utilisent des emojis (Font Awesome non chargé)
          </p>
        </div>
      )}
      
      <div className="flex h-screen">
        {/* Sidebar Moderne */}
        <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 dark:border-slate-700/50`}>
          {/* Header Logo */}
          <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Icon className="fas fa-university text-white text-sm" fallback="🏦" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white animate-pulse"></div>
              </div>
              {sidebarOpen && (
                <div className="transition-all duration-300">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    BankAdmin Pro
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Centre de contrôle</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.id} className="relative group">
                  <Link 
                    to={item.path}
                    onClick={() => setActiveMenuItem(item.id)}
                    className={`flex items-center p-2 rounded-lg transition-all duration-200 group ${
                      activeMenuItem === item.id 
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeMenuItem === item.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className={`${item.icon} text-sm ${activeMenuItem === item.id ? 'text-white' : item.color}`} fallback="📊" />
                    </div>
                    {sidebarOpen && (
                      <span className="ml-2 text-sm font-medium">{item.label}</span>
                    )}
                    {activeMenuItem === item.id && (
                      <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50">
            {sidebarOpen && (
              <div className="mb-3 p-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-user-shield text-white text-sm" fallback="👮" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Admin Principal</p>
                    <p className="text-xs text-slate-500">Tous privilèges</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Icon className="fas fa-sign-out-alt text-sm" fallback="🚪" />
              {sidebarOpen && <span className="ml-2 text-sm">Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* Zone principale */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Moderne */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleSidebar}
                  className="group p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                >
                  <Icon className="fas fa-bars text-sm group-hover:rotate-90 transition-transform duration-200" fallback="☰" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Gestion des Transactions
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Administration des virements et transactions
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110">
                    <Icon className="fas fa-bell text-slate-600 dark:text-slate-400 text-sm" fallback="🔔" />
                  </button>
                  {notifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                      {notifications}
                    </div>
                  )}
                </div>

                {/* Heure */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200/30 dark:border-orange-700/30">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                  <Icon className="fas fa-clock text-orange-600 dark:text-orange-400 text-sm" fallback="🕐" />
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Mode sombre */}
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Icon className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-slate-600'} transition-all duration-200 text-sm`} fallback={isDarkMode ? '☀️' : '🌙'} />
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200/30 dark:border-orange-700/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-user text-white text-xs" fallback="👤" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Icon className="fas fa-exclamation-triangle text-red-500 mr-2" fallback="⚠️" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Statistiques rapides */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Total Transactions</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{transactions.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-exchange-alt text-white text-sm" fallback="💱" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Effectuées</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{transactions.filter(t => t.etat === 'effectue').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-check-circle text-white text-sm" fallback="✅" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">En attente</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{transactions.filter(t => t.etat === 'en_attente').length}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-clock text-white text-sm" fallback="⏰" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Volume Total</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {formatMontant(transactions.reduce((sum, t) => sum + t.montant, 0))}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-coins text-white text-sm" fallback="💰" />
                  </div>
                </div>
              </div>
            </section>

            {/* Barre d'outils moderne */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Recherche */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="fas fa-search text-slate-400" fallback="🔍" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher une transaction..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    />
                  </div>                  {/* Filtre par type */}
                  <div className="relative">                    <select 
                      value={filterType} 
                      onChange={(e) => setFilterType(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">Tous les types</option>
                      {transactionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tri */}
                  <div className="flex space-x-2">
                    <select 
                      value={sortField} 
                      onChange={(e) => setSortField(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    >
                      <option value="dateTransfert">Date</option>
                      <option value="montant">Montant</option>
                      <option value="etat">État</option>
                      <option value="motif">Motif</option>
                    </select>
                    <button
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      <Icon className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} text-slate-600 dark:text-slate-300`} fallback={sortDirection === 'asc' ? '⬆️' : '⬇️'} />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* Exporter */}
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Icon className="fas fa-download text-sm" fallback="⬇️" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Tableau des transactions moderne */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              {/* En-tête du tableau */}
              <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Liste des Transactions ({getSortedTransactions().length})
                  </h3>
                </div>
              </div>

              {/* Contenu du tableau */}
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Icon className="fas fa-exchange-alt text-slate-400 text-2xl" fallback="💱" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Aucune transaction trouvée</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Les transactions apparaîtront ici</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'id' ? 'text-orange-600 dark:text-orange-400' : ''}`}
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>ID</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'id' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'montant' ? 'text-orange-600 dark:text-orange-400' : ''}`}
                          onClick={() => handleSort('montant')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Montant</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'montant' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Compte
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'dateTransfert' ? 'text-orange-600 dark:text-orange-400' : ''}`}
                          onClick={() => handleSort('dateTransfert')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'dateTransfert' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'etat' ? 'text-orange-600 dark:text-orange-400' : ''}`}
                          onClick={() => handleSort('etat')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>État</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'etat' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {currentTransactions.map((transaction, index) => (
                        <tr 
                          key={transaction.id} 
                          className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
                        >
                          {/* ID */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                                <Icon className="fas fa-hashtag text-white text-xs" fallback="#" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  #{transaction.id}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {transaction.motif}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Montant */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              {formatMontant(transaction.montant)}
                            </div>
                          </td>                          {/* Client */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {transaction.client.nom !== 'N/A' ? 
                                `${transaction.client.nom} ${transaction.client.prenom}` : 
                                'N/A'
                              }
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {transaction.client.email !== 'N/A' ? transaction.client.email : ''}
                            </div>
                          </td>

                          {/* Compte */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {transaction.compte.idcompte || 'N/A'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">                              Type: {transaction.compte.typecompte || 'N/A'}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {new Date(transaction.dateTransfert).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(transaction.dateTransfert).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* État */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.etat === 'effectue' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                                : transaction.etat === 'en_attente'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                transaction.etat === 'effectue' ? 'bg-emerald-500' : 
                                transaction.etat === 'en_attente' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              {getStatusLabel(transaction.etat)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewDetails(transaction)}
                                className="inline-flex items-center p-1.5 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg transition-all duration-200 transform hover:scale-110"
                                title="Voir les détails"
                              >
                                <Icon className="fas fa-eye text-xs" fallback="👁️" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Pagination moderne */}
            {getSortedTransactions().length > transactionsPerPage && (
              <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Affichage de <span className="font-medium">{indexOfFirstTransaction + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastTransaction, getSortedTransactions().length)}
                      </span>{' '}
                      sur <span className="font-medium">{getSortedTransactions().length}</span> résultats
                    </p>
                    <select
                      value={transactionsPerPage}
                      onChange={(e) => setTransactionsPerPage(Number(e.target.value))}
                      className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
                    >
                      <option value={10}>10 par page</option>
                      <option value={25}>25 par page</option>
                      <option value={50}>50 par page</option>
                      <option value={100}>100 par page</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                    >
                      <Icon className="fas fa-chevron-left text-xs" fallback="‹" />
                      <span>Précédent</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.ceil(getSortedTransactions().length / transactionsPerPage) }, (_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = currentPage === pageNumber;
                        const showPage = pageNumber === 1 || 
                                        pageNumber === Math.ceil(getSortedTransactions().length / transactionsPerPage) ||
                                        (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);

                        if (!showPage) {
                          if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                            return <span key={pageNumber} className="px-2 text-slate-400">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                              isCurrentPage
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }).filter(Boolean)}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(getSortedTransactions().length / transactionsPerPage)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                    >
                      <span>Suivant</span>
                      <Icon className="fas fa-chevron-right text-xs" fallback="›" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Carte de détails transaction */}
            {showDetailCard && selectedTransaction && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Détails de la Transaction
                    </h3>
                    <button
                      onClick={handleCloseCard}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                    >
                      <Icon className="fas fa-times text-lg" fallback="✕" />
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Transaction</label>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">#{selectedTransaction.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Montant</label>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatMontant(selectedTransaction.montant)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif</label>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{selectedTransaction.motif}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date & Heure</label>
                        <p className="text-slate-900 dark:text-slate-100 font-medium">
                          {new Date(selectedTransaction.dateTransfert).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(selectedTransaction.dateTransfert).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">État</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedTransaction.etat === 'effectue' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                            : selectedTransaction.etat === 'en_attente'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {getStatusLabel(selectedTransaction.etat)}
                        </span>
                      </div>
                    </div>
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client</label>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {selectedTransaction.client.nom !== 'N/A' ? 
                              `${selectedTransaction.client.nom} ${selectedTransaction.client.prenom}` : 
                              'Inconnu'
                            }
                          </p>
                          {selectedTransaction.client.email !== 'N/A' && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Email: {selectedTransaction.client.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Compte</label>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {selectedTransaction.compte.idcompte || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Type: {selectedTransaction.compte.typecompte || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Solde: {selectedTransaction.compte.solde ? 
                              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedTransaction.compte.solde) : 
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleCloseCard}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Footer Moderne */}
          <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                  © 2025 BankAdmin Pro - Gestion des transactions
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Système opérationnel</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <Icon className="fas fa-exchange-alt text-orange-500" fallback="💱" />
                  <span>{transactions.length} transactions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon className="fas fa-clock text-purple-500" fallback="🕐" />
                  <span>Dernière sync: {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ListTransactions;
