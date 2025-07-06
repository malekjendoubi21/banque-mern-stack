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

const ListUsers = () => {
  const navigate = useNavigate();
  const { isDarkMode, sidebarOpen, fontAwesomeLoaded, toggleTheme, toggleSidebar } = useAdminTheme();  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortField, setSortField] = useState('nom');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeMenuItem, setActiveMenuItem] = useState('users');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(2);
  // États pour les cartes de détails et de mise à jour
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    actif: true
  });

  // États pour l'ajout d'utilisateur
  const [showAddCard, setShowAddCard] = useState(false);
  const [addUserType, setAddUserType] = useState('client'); // 'client' ou 'admin'
  const [addFormData, setAddFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motdepasse: '',
    telephone: '',
    adresse: ''
  });

  // Menu items pour la sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-line', path: '/admin/dashboard', color: 'text-blue-600' },
    { id: 'users', label: 'Gestion Clients', icon: 'fas fa-users', path: '/admin/users', color: 'text-emerald-600' },
    { id: 'accounts', label: 'Comptes Bancaires', icon: 'fas fa-piggy-bank', path: '/admin/accounts', color: 'text-purple-600' },
    { id: 'transactions', label: 'Transactions', icon: 'fas fa-exchange-alt', path: '/admin/transactions', color: 'text-orange-600' },
    { id: 'reports', label: 'Rapports', icon: 'fas fa-chart-bar', path: '/admin/reports', color: 'text-red-600' },
    { id: 'security', label: 'Sécurité', icon: 'fas fa-shield-alt', path: '/admin/security', color: 'text-yellow-600' },
    { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog', path: '/admin/settings', color: 'text-gray-600' }  ];

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
  }, []);
  // Récupérer la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        // Utiliser la nouvelle route qui combine clients et administrateurs
        const response = await API.get('/clients/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Les données sont déjà formatées par le backend
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError('Erreur lors du chargement des utilisateurs');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // Fonctions de tri et filtrage
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setConfirmDelete(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await API.delete(`/clients/${userToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(users.filter(user => user.id !== userToDelete));
      setConfirmDelete(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await Promise.all(selectedUsers.map(userId => 
        API.delete(`/clients/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ));
      
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Erreur lors de la suppression multiple:', error);
      setError('Erreur lors de la suppression des utilisateurs');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Date création', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.nom,
        user.prenom,
        user.email,
        user.telephone,
        new Date(user.dateinscription).toLocaleDateString(),
        user.actif ? 'Actif' : 'Inactif'
      ].join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'utilisateurs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Afficher les détails d'un utilisateur
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailCard(true);
  };

  // Fermer la carte de détails
  const handleCloseDetailCard = () => {
    setShowDetailCard(false);
    setSelectedUser(null);
  };

  // Ouvrir la carte de mise à jour
  const handleOpenUpdateCard = (user) => {
    setSelectedUser(user);
    setUpdateFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      actif: user.actif
    });
    setShowDetailCard(false);
    setShowUpdateCard(true);
  };

  // Fermer la carte de mise à jour
  const handleCloseUpdateCard = () => {
    setShowUpdateCard(false);
    setSelectedUser(null);
    setUpdateFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      actif: true
    });
  };

  // Gérer les changements dans le formulaire de mise à jour
  const handleUpdateFormChange = (field, value) => {
    setUpdateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  // Soumettre la mise à jour
  const handleUpdateSubmit = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('admin_token');
      await API.put(`/clients/${selectedUser.id}`, updateFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...updateFormData }
          : user
      ));

      handleCloseUpdateCard();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour de l\'utilisateur');
    }
  };

  // Fonctions pour l'ajout d'utilisateur
  const handleOpenAddCard = (userType = 'client') => {
    setAddUserType(userType);
    setAddFormData({
      nom: '',
      prenom: '',
      email: '',
      motdepasse: '',
      telephone: '',
      adresse: ''
    });
    setShowAddCard(true);
  };

  const handleCloseAddCard = () => {
    setShowAddCard(false);
    setAddFormData({
      nom: '',
      prenom: '',
      email: '',
      motdepasse: '',
      telephone: '',
      adresse: ''
    });
  };

  const handleAddFormChange = (field, value) => {
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleAddSubmit = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = addUserType === 'client' ? '/clients' : '/administrateurs';
      
      // Préparer les données selon le type d'utilisateur
      const dataToSend = addUserType === 'client' 
        ? addFormData 
        : {
            nom: addFormData.nom,
            prenom: addFormData.prenom,
            email: addFormData.email,
            motdepasse: addFormData.motdepasse
          };

      const response = await API.post(endpoint, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Recharger la liste des utilisateurs
      const usersResponse = await API.get('/clients/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
        setUsers(usersResponse.data);
      handleCloseAddCard();
      
      // Afficher un message de succès
      setSuccessMessage(`${addUserType === 'client' ? 'Client' : 'Administrateur'} ajouté avec succès !`);
      setError(''); // Réinitialiser les erreurs
      
      // Masquer le message de succès après 5 secondes
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  // Afficher l'indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 dark:text-slate-300 font-medium">Chargement des utilisateurs...</p>
          </div>
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Icon className="fas fa-university text-white text-sm" fallback="🏦" />
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
              <div className="mb-3 p-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
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
                  className="group p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                >
                  <Icon className="fas fa-bars text-sm group-hover:rotate-90 transition-transform duration-200" fallback="☰" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Gestion des Utilisateurs
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Administration des clients et utilisateurs
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
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-700/30">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <Icon className="fas fa-clock text-emerald-600 dark:text-emerald-400 text-sm" fallback="🕐" />
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>                {/* Mode sombre */}
                <button
                  onClick={toggleTheme}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Icon className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-slate-600'} transition-all duration-200 text-sm`} fallback={isDarkMode ? '☀️' : '🌙'} />
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-user text-white text-xs" fallback="👤" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                </div>
              </div>
            </div>
          </header>

          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Icon className="fas fa-exclamation-triangle text-red-500 mr-2" fallback="⚠️" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Message de succès */}
            {successMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300 p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Icon className="fas fa-check-circle text-emerald-500 mr-2" fallback="✅" />
                  <span className="font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Statistiques rapides */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Total Utilisateurs</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{users.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-users text-white text-sm" fallback="👥" />
                  </div>
                </div>
              </div>

        

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Nouveaux ce mois</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {users.filter(u => {
                        const userDate = new Date(u.dateinscription);
                        const now = new Date();
                        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-user-plus text-white text-sm" fallback="➕" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Sélectionnés</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{selectedUsers.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Icon className="fas fa-check-square text-white text-sm" fallback="☑️" />
                  </div>
                </div>
              </div>
            </section>

            {/* Barre d'outils moderne */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Recherche */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon className="fas fa-search text-slate-400" fallback="🔍" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {/* Boutons de filtre rapide */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterRole('all')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                        filterRole === 'all' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="fas fa-users text-sm" fallback="👥" />
                      <span>Tous</span>
                    </button>
                    <button
                      onClick={() => setFilterRole('client')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                        filterRole === 'client' 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="fas fa-user text-sm" fallback="👤" />
                      <span>Clients</span>
                    </button>                    <button
                      onClick={() => setFilterRole('administrateur')}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                        filterRole === 'administrateur' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="fas fa-user-shield text-sm" fallback="🛡️" />
                      <span>Admins</span>
                    </button>
                  </div>

                  {/* Filtre par rôle (dropdown de secours) */}
                  <div className="relative">                    <select 
                      value={filterRole} 
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    >
                      <option value="all">Tous les rôles</option>
                      <option value="client">Clients</option>
                      <option value="administrateur">Administrateurs</option>
                    </select>
                  </div>

                  {/* Tri */}
                  <div className="flex space-x-2">
                    <select 
                      value={sortField} 
                      onChange={(e) => setSortField(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                    >
                      <option value="nom">Nom</option>
                      <option value="prenom">Prénom</option>
                      <option value="email">Email</option>
                      <option value="dateinscription">Date création</option>
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
                  {/* Actions groupées */}
                  {selectedUsers.length > 0 && (
                    <button
                      onClick={() => handleBulkDelete()}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <Icon className="fas fa-trash text-sm" fallback="🗑️" />
                      <span>Supprimer ({selectedUsers.length})</span>
                    </button>
                  )}                  {/* Exporter */}
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Icon className="fas fa-download text-sm" fallback="⬇️" />
                    <span>Exporter</span>
                  </button>

                  {/* Ajouter Client */}
                  <button
                    onClick={() => handleOpenAddCard('client')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Icon className="fas fa-user-plus text-sm" fallback="👤" />
                    <span>Client</span>
                  </button>                  {/* Ajouter Admin */}
                  <button
                    onClick={() => handleOpenAddCard('administrateur')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <Icon className="fas fa-user-shield text-sm" fallback="🛡️" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Tableau des utilisateurs moderne */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              {/* En-tête du tableau */}
              <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Liste des Utilisateurs ({filteredUsers.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Tout sélectionner</span>
                  </div>
                </div>
              </div>

              {/* Contenu du tableau */}
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Icon className="fas fa-users text-slate-400 text-2xl" fallback="👥" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Aucun utilisateur trouvé</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Commencez par ajouter des utilisateurs</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <input 
                            type="checkbox" 
                            onChange={handleSelectAll}
                            checked={currentUsers.length > 0 && selectedUsers.length === currentUsers.length}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'nom' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('nom')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Nom</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'nom' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'prenom' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('prenom')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Prénom</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'prenom' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'email' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Email</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'email' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'telephone' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('telephone')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Téléphone</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'telephone' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'dateinscription' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('dateinscription')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Date création</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'dateinscription' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th 
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors ${sortField === 'actif' ? 'text-blue-600 dark:text-blue-400' : ''}`}
                          onClick={() => handleSort('actif')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Statut</span>
                            <Icon className={`fas fa-sort text-xs ${sortField === 'actif' ? (sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down') : ''}`} fallback="↕️" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {currentUsers.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 ${
                            selectedUsers.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                          </td>

                          {/* Nom */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white text-sm font-semibold">
                                  {user.nom.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {user.nom}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Prénom */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                              {user.prenom}
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {user.email}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Vérifié
                            </div>
                          </td>

                          {/* Téléphone */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {user.telephone || 'N/A'}
                            </div>
                          </td>

                          {/* Date création */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              {new Date(user.dateinscription).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {new Date(user.dateinscription).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Statut */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.actif 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                user.actif ? 'bg-emerald-500' : 'bg-red-500'
                              }`}></div>
                              {user.actif ? 'Actif' : 'Inactif'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="inline-flex items-center p-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 transform hover:scale-110"
                                title="Voir les détails"
                              >
                                <Icon className="fas fa-eye text-xs" fallback="👁️" />
                              </button>
                              <button
                                onClick={() => handleOpenUpdateCard(user)}
                                className="inline-flex items-center p-1.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all duration-200 transform hover:scale-110"
                                title="Modifier"
                              >
                                <Icon className="fas fa-edit text-xs" fallback="✏️" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id)} 
                                className="inline-flex items-center p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 transform hover:scale-110"
                                title="Supprimer"
                              >
                                <Icon className="fas fa-trash text-xs" fallback="🗑️" />
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
            {filteredUsers.length > usersPerPage && (
              <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Affichage de <span className="font-medium">{indexOfFirstUser + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastUser, filteredUsers.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredUsers.length}</span> résultats
                    </p>
                    <select
                      value={usersPerPage}
                      onChange={(e) => setUsersPerPage(Number(e.target.value))}
                      className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
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
                      {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = currentPage === pageNumber;
                        const showPage = pageNumber === 1 || 
                                        pageNumber === Math.ceil(filteredUsers.length / usersPerPage) ||
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
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
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
                      disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                    >
                      <span>Suivant</span>
                      <Icon className="fas fa-chevron-right text-xs" fallback="›" />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Modale de confirmation de suppression */}
            {confirmDelete && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Icon className="fas fa-exclamation-triangle text-red-600 dark:text-red-400" fallback="⚠️" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Confirmer la suppression
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Cette action est irréversible
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-6">
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses données seront définitivement perdues.
                  </p>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setConfirmDelete(false);
                        setUserToDelete(null);
                      }}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={confirmDeleteUser}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Carte de détails d'utilisateur */}
            {showDetailCard && selectedUser && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Détails de l'utilisateur
                    </h3>
                    <button 
                      onClick={handleCloseDetailCard}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      <Icon className="fas fa-times text-slate-600 dark:text-slate-400" fallback="✖️" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Nom complet</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {selectedUser.nom} {selectedUser.prenom}
                      </h4>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Email</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {selectedUser.email}
                      </h4>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Téléphone</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {selectedUser.telephone || 'N/A'}
                      </h4>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Adresse</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {selectedUser.adresse || 'Non spécifiée'}
                      </h4>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Date de création</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {new Date(selectedUser.dateinscription).toLocaleDateString('fr-FR')}
                      </h4>
                    </div>

                    <div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">Statut</span>
                      <h4 className="text-slate-800 dark:text-slate-200 text-lg font-semibold">
                        {selectedUser.actif ? 'Actif' : 'Inactif'}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button 
                      onClick={() => handleOpenUpdateCard(selectedUser)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Icon className="fas fa-edit text-sm" fallback="✏️" />
                      <span className="ml-2">Modifier</span>
                    </button>
                    <button 
                      onClick={confirmDeleteUser}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Icon className="fas fa-trash text-sm" fallback="🗑️" />
                      <span className="ml-2">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Carte de mise à jour d'utilisateur */}
            {showUpdateCard && selectedUser && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Modifier l'utilisateur
                    </h3>
                    <button 
                      onClick={handleCloseUpdateCard}
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      <Icon className="fas fa-times text-slate-600 dark:text-slate-400" fallback="✖️" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Champ Nom */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1" htmlFor="nom">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        value={updateFormData.nom}
                        onChange={(e) => handleUpdateFormChange('nom', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez le nom"
                      />
                    </div>

                    {/* Champ Prénom */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1" htmlFor="prenom">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        value={updateFormData.prenom}
                        onChange={(e) => handleUpdateFormChange('prenom', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez le prénom"
                      />
                    </div>

                    {/* Champ Email */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={updateFormData.email}
                        onChange={(e) => handleUpdateFormChange('email', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez l'email"
                        disabled
                      />
                    </div>

                    {/* Champ Téléphone */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1" htmlFor="telephone">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        id="telephone"
                        value={updateFormData.telephone}
                        onChange={(e) => handleUpdateFormChange('telephone', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez le téléphone"
                      />
                    </div>

                    {/* Champ Adresse */}
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-1" htmlFor="adresse">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        value={updateFormData.adresse}
                        onChange={(e) => handleUpdateFormChange('adresse', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez l'adresse"
                      />
                    </div>

                    {/* Statut Actif */}
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="actif"
                        checked={updateFormData.actif}
                        onChange={(e) => handleUpdateFormChange('actif', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label className="ml-2 text-slate-700 dark:text-slate-300 text-sm font-medium" htmlFor="actif">
                        Actif
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button 
                      onClick={handleUpdateSubmit}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <Icon className="fas fa-save text-sm" fallback="💾" />
                      <span className="ml-2">Enregistrer les modifications</span>
                    </button>
                    <button 
                      onClick={handleCloseUpdateCard}
                      className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>            )}
          </main>

          {/* Footer Moderne */}
          <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                  © 2025 BankAdmin Pro - Gestion des utilisateurs
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Système opérationnel</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <Icon className="fas fa-users text-blue-500" fallback="👥" />
                  <span>{users.length} utilisateurs</span>
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

      {/* Carte de détails utilisateur */}
      {showDetailCard && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Détails de l'utilisateur
              </h3>
              <button
                onClick={handleCloseDetailCard}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors duration-200"
              >
                <Icon className="fas fa-times text-lg" fallback="✕" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">ID Utilisateur</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">#{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nom</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{selectedUser.nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Prénom</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{selectedUser.prenom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Téléphone</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{selectedUser.telephone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Adresse</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">{selectedUser.adresse || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Date de création</label>
                  <p className="text-lg text-slate-900 dark:text-slate-100">
                    {new Date(selectedUser.dateinscription).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Statut</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedUser.actif 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      selectedUser.actif ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></div>
                    {selectedUser.actif ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={handleCloseDetailCard}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200"
              >
                Fermer
              </button>
              <button
                onClick={() => handleOpenUpdateCard(selectedUser)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Icon className="fas fa-edit mr-2" fallback="✏️" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carte de mise à jour utilisateur */}
      {showUpdateCard && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Modifier l'utilisateur #{selectedUser.id}
              </h3>
              <button
                onClick={handleCloseUpdateCard}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors duration-200"
              >
                <Icon className="fas fa-times text-lg" fallback="✕" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={updateFormData.nom}
                    onChange={(e) => handleUpdateFormChange('nom', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={updateFormData.prenom}
                    onChange={(e) => handleUpdateFormChange('prenom', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={updateFormData.email}
                    onChange={(e) => handleUpdateFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={updateFormData.telephone}
                    onChange={(e) => handleUpdateFormChange('telephone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Adresse
                  </label>
                  <textarea
                    value={updateFormData.adresse}
                    onChange={(e) => handleUpdateFormChange('adresse', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={updateFormData.actif}
                    onChange={(e) => handleUpdateFormChange('actif', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={true}>Actif</option>
                    <option value={false}>Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={handleCloseUpdateCard}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Icon className="fas fa-save mr-2" fallback="💾" />
                Enregistrer
              </button>
            </div>
          </div>        </div>
      )}

      {/* Modal d'ajout d'utilisateur */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Ajouter un {addUserType === 'client' ? 'Client' : 'Administrateur'}
              </h3>
              <button
                onClick={handleCloseAddCard}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors duration-200"
              >
                <Icon className="fas fa-times text-lg" fallback="✕" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={addFormData.nom}
                    onChange={(e) => handleAddFormChange('nom', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Entrez le nom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={addFormData.prenom}
                    onChange={(e) => handleAddFormChange('prenom', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Entrez le prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={addFormData.email}
                    onChange={(e) => handleAddFormChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Entrez l'email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={addFormData.motdepasse}
                    onChange={(e) => handleAddFormChange('motdepasse', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Entrez le mot de passe"
                    required
                  />
                </div>
              </div>
                <div className="space-y-4">
                {addUserType === 'client' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={addFormData.telephone}
                        onChange={(e) => handleAddFormChange('telephone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez le téléphone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Adresse
                      </label>
                      <textarea
                        value={addFormData.adresse}
                        onChange={(e) => handleAddFormChange('adresse', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        placeholder="Entrez l'adresse"
                      />
                    </div>
                  </>
                )}
                
                {addUserType === 'administrateur' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                      <Icon className="fas fa-info-circle" fallback="ℹ️" />
                      <span className="font-medium text-sm">Information</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                      Les administrateurs auront accès complet au système de gestion bancaire.
                      Seuls les champs obligatoires sont requis pour un administrateur.
                    </p>
                  </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
                    <Icon className="fas fa-shield-alt" fallback="🛡️" />
                    <span className="font-medium text-sm">Sécurité</span>
                  </div>
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">
                    Le mot de passe sera automatiquement sécurisé avec un hash BCrypt.
                    Assurez-vous d'utiliser un mot de passe fort.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={handleCloseAddCard}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={!addFormData.nom || !addFormData.prenom || !addFormData.email || !addFormData.motdepasse}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Icon className="fas fa-plus mr-2" fallback="➕" />
                Créer {addUserType === 'client' ? 'le Client' : 'l\'Administrateur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUsers;
