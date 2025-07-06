import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utlis/api';
import { useAdminTheme } from '../../contexts/AdminThemeContext';

// Composant d'icône simplifié
const Icon = ({ className, fallback, ...props }) => {
  return (
    <i className={className} {...props}></i>
  );
};

// Fonction utilitaire pour formater les dates de manière sécurisée
const formatDate = (dateString) => {
  if (!dateString) return 'Non défini';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date invalide';
  
  return date.toLocaleDateString('fr-FR');
};

// Fonction utilitaire pour formater les dates avec l'heure
const formatDateTime = (dateString) => {
  if (!dateString) return 'Non défini';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Date invalide';
  
  return date.toLocaleString('fr-FR');
};

const ListAccounts = () => {
  const navigate = useNavigate();
  const { isDarkMode, sidebarOpen, fontAwesomeLoaded, toggleTheme, toggleSidebar } = useAdminTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('accounts');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [confirmUpdateStatus, setConfirmUpdateStatus] = useState(false);  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // États pour les cartes de détails et de mise à jour
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    solde: 0,
    type: '',
    etat: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-line', path: '/admin/dashboard', color: 'text-blue-600' },
    { id: 'users', label: 'Gestion Clients', icon: 'fas fa-users', path: '/admin/users', color: 'text-emerald-600' },
    { id: 'accounts', label: 'Comptes Bancaires', icon: 'fas fa-piggy-bank', path: '/admin/accounts', color: 'text-purple-600' },
    { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt', path: '/admin/transactions', color: 'text-orange-600' },
    { id: 'reports', label: 'Rapports', icon: 'fas fa-chart-bar', path: '/admin/reports', color: 'text-red-600' },
    { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt', path: '/admin/security', color: 'text-yellow-600' },
    { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog', path: '/admin/settings', color: 'text-gray-600' }
  ];

  // Récupérer la liste des comptes
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }        const response = await API.get('/comptes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
          
        console.log('Données reçues du backend:', response.data);
        
        const formattedAccounts = response.data.map(compte => {
          // Utiliser directement les données relationnelles du backend
          // Sequelize peut utiliser 'Client' (avec majuscule) comme nom d'association par défaut
          const client = compte.Client || compte.client || null;
          
          console.log('Compte:', compte.idcompte, 'Client associé:', client);
          
          return {
            id: compte.idcompte,
            solde: compte.solde,
            type: compte.typecompte, // Utiliser le nom correct du champ backend
            dateCreation: compte.datecreation, // Utiliser le nom correct du champ backend
            etat: compte.etat,
            client: {
              id: client ? client.idclient : null,
              nom: client ? client.nom : 'Inconnu',
              prenom: client ? client.prenom : '',
              email: client ? client.email : 'Non renseigné'
            }
          };
        });
        
        setAccounts(formattedAccounts);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors de la récupération des comptes: ' + err.message);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [navigate]);

  // Filtrer les comptes selon la recherche et les filtres
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.id.toString().includes(searchTerm) ||
      `${account.client.nom} ${account.client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || account.etat === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Trier les comptes
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'client') {
      const nameA = `${a.client.nom} ${a.client.prenom}`.toLowerCase();
      const nameB = `${b.client.nom} ${b.client.prenom}`.toLowerCase();
      
      comparison = nameA > nameB ? 1 : (nameA < nameB ? -1 : 0);
    } else {
      comparison = a[sortField] > b[sortField] ? 1 : (a[sortField] < b[sortField] ? -1 : 0);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Obtenir les comptes de la page courante
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = sortedAccounts.slice(indexOfFirstAccount, indexOfLastAccount);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Gérer le changement de tri
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Gérer la sélection de tous les comptes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAccounts(currentAccounts.map(account => account.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  // Gérer la sélection d'un compte
  const handleSelectAccount = (accountId) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  // Supprimer un compte
  const handleDeleteAccount = (id) => {
    setAccountToDelete(id);
    setConfirmDelete(true);
  };

  // Supprimer plusieurs comptes
  const handleBulkDelete = async () => {
    if (selectedAccounts.length === 0) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await Promise.all(selectedAccounts.map(accountId => 
        API.delete(`/comptes/${accountId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ));
      
      setAccounts(accounts.filter(account => !selectedAccounts.includes(account.id)));
      setSelectedAccounts([]);
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    }
  };

  // Confirmer la suppression
  const confirmDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await API.delete(`/comptes/${accountToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAccounts(accounts.filter(account => account.id !== accountToDelete));
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountToDelete));
      setConfirmDelete(false);
      setAccountToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression: ' + err.message);
    }
  };

  // Mettre à jour l'état d'un compte
  const handleUpdateAccountStatus = (id, status) => {
    setAccountToUpdate(id);
    setNewStatus(status);
    setConfirmUpdateStatus(true);
  };

  // Confirmer la mise à jour de l'état
  const confirmUpdateAccountStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await API.put(`/comptes/${accountToUpdate}/etat`, 
        { etat: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setAccounts(accounts.map(account => {
        if (account.id === accountToUpdate) {
          return { ...account, etat: newStatus };
        }
        return account;
      }));
      
      setConfirmUpdateStatus(false);
      setAccountToUpdate(null);
      setNewStatus('');
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  // Exporter les comptes
  const handleExportAccounts = () => {
    const accountsToExport = selectedAccounts.length > 0 
      ? accounts.filter(account => selectedAccounts.includes(account.id)) 
      : filteredAccounts;
    
    const csv = [
      ['ID', 'Solde', 'Type', 'Client', 'Date de création', 'État'],
      ...accountsToExport.map(account => [
        account.id,
        account.solde.toFixed(2),
        account.type,
        `${account.client.nom} ${account.client.prenom}`,
        formatDate(account.dateCreation),
        account.etat
      ])
    ].map(row => row.join(','));
    
    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'liste_comptes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formater le solde
  const formatSolde = (solde) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(solde);
  };
  // Obtenir le label d'état
  const getStatusLabel = (etat) => {
    switch(etat) {
      case 'pending':
        return 'En attente';
      case 'active':
        return 'Actif';
      case 'rejected':
        return 'Rejeté';
      default:
        return etat.charAt(0).toUpperCase() + etat.slice(1);
    }
  };

  // Fonctions pour la gestion des cartes de détails et de mise à jour
  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setShowDetailCard(true);
  };

  const handleOpenUpdateCard = (account) => {
    setSelectedAccount(account);
    setUpdateFormData({
      solde: account.solde,
      type: account.type,
      etat: account.etat
    });
    setShowUpdateCard(true);
  };

  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setSelectedAccount(null);
  };

  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedAccount(null);
    setUpdateFormData({
      solde: 0,
      type: '',
      etat: ''
    });
  };

  const handleUpdateFormChange = (field, value) => {
    setUpdateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateSubmit = async () => {
    if (!selectedAccount) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      // Mise à jour du solde
      if (updateFormData.solde !== selectedAccount.solde) {
        await API.put(`/comptes/${selectedAccount.id}/solde`, 
          { solde: updateFormData.solde },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      // Mise à jour de l'état
      if (updateFormData.etat !== selectedAccount.etat) {
        await API.put(`/comptes/${selectedAccount.id}/etat`, 
          { etat: updateFormData.etat },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      // Mise à jour du type si l'API le permet
      if (updateFormData.type !== selectedAccount.type) {
        try {
          await API.put(`/comptes/${selectedAccount.id}`, 
            { typeCompte: updateFormData.type },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
        } catch (typeError) {
          console.warn('Mise à jour du type de compte non supportée:', typeError.message);
        }
      }

      // Mettre à jour les données locales
      setAccounts(accounts.map(account => {
        if (account.id === selectedAccount.id) {
          return {
            ...account,
            solde: updateFormData.solde,
            type: updateFormData.type,
            etat: updateFormData.etat
          };
        }
        return account;
      }));

      handleCloseUpdateCard();
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + err.message);
    }
  };

  // Afficher l'indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Chargement des comptes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Notification si Font Awesome ne charge pas */}
      {!fontAwesomeLoaded && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded shadow-lg z-50">
          <p className="text-sm">
            <Icon className="fas fa-exclamation-triangle" /> 
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <i className="fas fa-university text-white text-sm"></i>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white animate-pulse"></div>
              </div>
              {sidebarOpen && (
                <div className="transition-all duration-300">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeMenuItem === item.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <i className={`${item.icon} text-sm ${activeMenuItem === item.id ? 'text-white' : item.color}`}></i>
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
              <div className="mb-3 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-shield text-white text-sm"></i>
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
              <i className="fas fa-sign-out-alt text-sm"></i>
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
                  className="group p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                >
                  <i className="fas fa-bars text-sm group-hover:rotate-90 transition-transform duration-200"></i>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Gestion des Comptes
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Administration et surveillance des comptes bancaires
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <div className="relative">
                  <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110">
                    <Icon className="fas fa-bell text-slate-600 dark:text-slate-400 text-sm" />
                  </button>
                  {notifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                      {notifications}
                    </div>
                  )}
                </div>

                {/* Heure */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-700/30">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <Icon className="fas fa-clock text-emerald-600 dark:text-emerald-400 text-sm" />
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Mode sombre */}
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Icon className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-slate-600'} transition-all duration-200 text-sm`} />
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-white text-xs"></i>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Icon className="fas fa-exclamation-triangle mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Bannière d'information */}
            <section className="relative">
              <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 rounded-xl p-5 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -ml-18 -mb-18"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">💰 Comptes Bancaires</h2>
                      <p className="text-purple-100 mb-4">Gérez et supervisez tous les comptes de vos clients</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Icon className="fas fa-piggy-bank mr-2" />
                          <span>{accounts.length} comptes au total</span>
                        </div>
                        <div className="flex items-center">
                          <Icon className="fas fa-users mr-2" />
                          <span>{filteredAccounts.length} comptes filtrés</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <Icon className="fas fa-chart-line text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Barre d'outils moderne */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <div className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* Recherche */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="fas fa-search text-slate-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Rechercher un compte..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                      />
                    </div>

                    {/* Filtre statut */}
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">Tous les états</option>
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="rejected">Rejeté</option>
                    </select>                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedAccounts.length > 0 && (
                      <button 
                        onClick={() => handleBulkDelete()}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <Icon className="fas fa-trash mr-2" />
                        <span>Supprimer ({selectedAccounts.length})</span>
                      </button>
                    )}
                    
                    <Link 
                      to="/admin/accounts/new" 
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Icon className="fas fa-plus mr-2" />
                      Ajouter
                    </Link>
                    
                    <button 
                      onClick={handleExportAccounts}
                      disabled={accounts.length === 0}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed"
                    >
                      <Icon className="fas fa-download mr-2" />
                      Exporter
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Tableau des comptes ou message d'absence */}
            {accounts.length === 0 ? (
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-8 text-center">
                <Icon className="fas fa-inbox text-4xl text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Aucun compte trouvé</h3>
                <p className="text-slate-500 dark:text-slate-500">Aucun compte bancaire n'est disponible pour le moment.</p>
              </div>
            ) : (
              <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll}
                            checked={currentAccounts.length > 0 && selectedAccounts.length === currentAccounts.length}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('id')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>ID</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('solde')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Solde</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('type')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Type</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('client')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Client</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('dateCreation')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date création</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
                          onClick={() => handleSort('etat')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>État</span>
                            <Icon className="fas fa-sort text-xs" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {currentAccounts.map(account => (
                        <tr 
                          key={account.id} 
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 ${
                            selectedAccounts.includes(account.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              checked={selectedAccounts.includes(account.id)}
                              onChange={() => handleSelectAccount(account.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                            #{account.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatSolde(account.solde)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {account.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              to={`/admin/users/${account.client.id}`} 
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                            >
                              {account.client.nom} {account.client.prenom}
                            </Link>
                          </td>                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(account.dateCreation)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              account.etat === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                : account.etat === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {getStatusLabel(account.etat)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewDetails(account)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                title="Voir"
                              >
                                <Icon className="fas fa-eye" />
                              </button>
                              <button
                                onClick={() => handleOpenUpdateCard(account)}
                                className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
                                title="Modifier"
                              >
                                <Icon className="fas fa-edit" />
                              </button>
                              
                              {account.etat === 'pending' ? (
                                <>
                                  <button 
                                    onClick={() => handleUpdateAccountStatus(account.id, 'active')}
                                    className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
                                    title="Approuver"
                                  >
                                    <Icon className="fas fa-check" />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateAccountStatus(account.id, 'rejected')}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                    title="Rejeter"
                                  >
                                    <Icon className="fas fa-times" />
                                  </button>
                                </>
                              ) : account.etat === 'active' ? (
                                <button 
                                  onClick={() => handleUpdateAccountStatus(account.id, 'rejected')}
                                  className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors duration-200"
                                  title="Bloquer"
                                >
                                  <Icon className="fas fa-ban" />
                                </button>
                              ) : account.etat === 'rejected' ? (
                                <button 
                                  onClick={() => handleUpdateAccountStatus(account.id, 'active')}
                                  className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
                                  title="Activer"
                                >
                                  <Icon className="fas fa-check-circle" />
                                </button>
                              ) : null}
                              
                              <button 
                                onClick={() => handleDeleteAccount(account.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                title="Supprimer"
                              >
                                <Icon className="fas fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Pagination moderne */}
            {filteredAccounts.length > accountsPerPage && (
              <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(filteredAccounts.length / accountsPerPage)}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Affichage de{' '}
                        <span className="font-medium">{indexOfFirstAccount + 1}</span>
                        {' '}à{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastAccount, filteredAccounts.length)}
                        </span>
                        {' '}sur{' '}
                        <span className="font-medium">{filteredAccounts.length}</span>
                        {' '}résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Précédent</span>
                          <Icon className="fas fa-chevron-left h-3 w-3" />
                        </button>
                        
                        {Array.from({ length: Math.ceil(filteredAccounts.length / accountsPerPage) }).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === index + 1
                                ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === Math.ceil(filteredAccounts.length / accountsPerPage)}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Suivant</span>
                          <Icon className="fas fa-chevron-right h-3 w-3" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Statistiques */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total</p>
                    <p className="text-2xl font-bold">{accounts.length}</p>
                  </div>
                  <Icon className="fas fa-chart-bar text-2xl text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Filtrés</p>
                    <p className="text-2xl font-bold">{filteredAccounts.length}</p>
                  </div>
                  <Icon className="fas fa-filter text-2xl text-emerald-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Sélectionnés</p>
                    <p className="text-2xl font-bold">{selectedAccounts.length}</p>
                  </div>
                  <Icon className="fas fa-check-square text-2xl text-purple-200" />
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Modals */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <Icon className="fas fa-exclamation-triangle text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Confirmation de suppression
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Êtes-vous sûr de vouloir supprimer ce compte ?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                Cette action est irréversible.
              </p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => {
                  setConfirmDelete(false);
                  setAccountToDelete(null);
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmUpdateStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${
                newStatus === 'active' ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-orange-100 dark:bg-orange-900'
              }`}>
                <Icon className={`fas ${newStatus === 'active' ? 'fa-check text-emerald-600' : 'fa-ban text-orange-600'}`} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Confirmation de changement d'état
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Êtes-vous sûr de vouloir {newStatus === 'active' ? 'activer' : 'bloquer'} ce compte ?
              </p>
            </div>
            <div className="mt-6 flex space-x-3">
              <button 
                onClick={() => {
                  setConfirmUpdateStatus(false);
                  setAccountToUpdate(null);
                  setNewStatus('');
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                Annuler
              </button>
              <button 
                onClick={confirmUpdateAccountStatus}
                className={`flex-1 ${
                  newStatus === 'active' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white py-2 px-4 rounded-lg transition-colors duration-200`}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte de détails */}
      {showDetailCard && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Détails du compte #{selectedAccount.id}
              </h3>
              <button 
                onClick={handleCloseDetailCard}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <Icon className="fas fa-times" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">ID du compte</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  #{selectedAccount.id}
                </h4>
              </div>
              
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Solde</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  {formatSolde(selectedAccount.solde)}
                </h4>
              </div>
              
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Type de compte</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  {selectedAccount.type}
                </h4>
              </div>
              
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Client</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  {selectedAccount.client.nom} {selectedAccount.client.prenom}
                </h4>
              </div>
              
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">Date de création</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  {formatDate(selectedAccount.dateCreation)}
                </h4>
              </div>
              
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-sm">État</span>
                <h4 className="text-slate-900 dark:text-slate-100 font-semibold">
                  {getStatusLabel(selectedAccount.etat)}
                </h4>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={handleCloseDetailCard}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                Fermer
              </button>
              
              <button 
                onClick={() => handleOpenUpdateCard(selectedAccount)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte de mise à jour */}
      {showUpdateCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Mise à jour du compte #{selectedAccount.id}
              </h3>
              <button 
                onClick={handleCloseUpdateCard}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <Icon className="fas fa-times" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">
                  Solde
                </label>
                <input
                  type="number"
                  value={updateFormData.solde}
                  onChange={(e) => handleUpdateFormChange('solde', parseFloat(e.target.value))}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">
                  Type de compte
                </label>
                <input
                  type="text"
                  value={updateFormData.type}
                  onChange={(e) => handleUpdateFormChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
              
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-sm mb-1">
                  État
                </label>
                <select 
                  value={updateFormData.etat} 
                  onChange={(e) => handleUpdateFormChange('etat', e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={handleCloseUpdateCard}
                className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                Annuler
              </button>
              
              <button 
                onClick={handleUpdateSubmit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>        </div>
      )}

      {/* Carte de détails compte */}
      {showDetailCard && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Détails du compte #{selectedAccount.id}
              </h3>
              <button
                onClick={handleCloseDetailCard}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <Icon className="fas fa-times h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Informations du compte</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">ID:</span>
                      <span className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-100">#{selectedAccount.id}</span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Solde:</span>
                      <span className="ml-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                        {formatSolde(selectedAccount.solde)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="ml-2 text-sm text-slate-900 dark:text-slate-100">
                        {selectedAccount.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">État:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAccount.etat === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        selectedAccount.etat === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {getStatusLabel(selectedAccount.etat)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Date de création:</span>
                      <span className="ml-2 text-sm text-slate-900 dark:text-slate-100">
                        {formatDateTime(selectedAccount.dateCreation)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Informations client</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Client:</span>
                      <span className="ml-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {selectedAccount.client.nom} {selectedAccount.client.prenom}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">Email:</span>
                      <span className="ml-2 text-sm text-slate-900 dark:text-slate-100">
                        {selectedAccount.client.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-700 space-x-3">
              <button
                onClick={handleCloseDetailCard}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200"
              >
                Fermer
              </button>
              <button
                onClick={() => handleOpenUpdateCard(selectedAccount)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <Icon className="fas fa-edit mr-2" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte de mise à jour compte */}
      {showUpdateCard && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                Modifier le compte #{selectedAccount.id}
              </h3>
              <button
                onClick={handleCloseUpdateCard}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
              >
                <Icon className="fas fa-times h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Solde (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={updateFormData.solde}
                      onChange={(e) => handleUpdateFormChange('solde', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Type de compte *
                    </label>
                    <select
                      value={updateFormData.type}
                      onChange={(e) => handleUpdateFormChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="Courant">Compte Courant</option>
                      <option value="Epargne">Compte Épargne</option>
                      <option value="Professionnel">Compte Professionnel</option>
                      <option value="Etudiant">Compte Étudiant</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      État du compte *
                    </label>
                    <select
                      value={updateFormData.etat}
                      onChange={(e) => handleUpdateFormChange('etat', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      required
                    >
                      <option value="">Sélectionner un état</option>
                      <option value="pending">En attente</option>
                      <option value="active">Actif</option>
                      <option value="rejected">Rejeté</option>
                      <option value="blocked">Bloqué</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Informations client</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedAccount.client.nom} {selectedAccount.client.prenom}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedAccount.client.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-700 space-x-3">
              <button
                onClick={handleCloseUpdateCard}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
              >
                <Icon className="fas fa-save mr-2" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListAccounts;
