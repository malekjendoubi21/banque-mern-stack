import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminTheme } from '../../contexts/AdminThemeContext';
import API from '../../utlis/api';

// Composant d'icône simplifié
const Icon = ({ className, fallback, ...props }) => {
  return (
    <i className={className} {...props}></i>
  );
};

function DashboardAdmin() {
  const { isDarkMode, sidebarOpen, fontAwesomeLoaded, toggleTheme, toggleSidebar } = useAdminTheme();
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);
  const [statsData, setStatsData] = useState({
    users: { count: 0, growth: 0, trend: 'up' },
    accounts: { count: 0, growth: 0, trend: 'up' },
    transactions: { count: 0, growth: 0, trend: 'up' },
    revenue: { count: 0, growth: 0, trend: 'up' }
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Récupérer les statistiques du dashboard
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          navigate('/admin/login');
          return;
        }

        const response = await API.get('/comptes/dashboard-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Statistiques récupérées:', response.data);

        setStatsData({
          users: { count: response.data.users.count, growth: 12.5, trend: 'up' },
          accounts: { count: response.data.accounts.count, growth: 8.3, trend: 'up' },
          transactions: { count: response.data.transactions.count, growth: -2.1, trend: 'up' },
          revenue: { count: response.data.revenue.count, growth: 15.7, trend: 'up' }
        });

        setRecentActivities(response.data.recentActivities || []);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };
  const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-FR').format(number);
  };

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
              <div className="relative">                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
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
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'                    }`}
                  >                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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
              ))}            </div>
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
        </aside>        {/* Zone principale */}
        <div className="flex-1 flex flex-col overflow-hidden">          {/* Header Moderne */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">                <button 
                  onClick={toggleSidebar}
                  className="group p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                >
                  <i className="fas fa-bars text-sm group-hover:rotate-90 transition-transform duration-200"></i>
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Dashboard Administrateur
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Supervision complète de votre système bancaire
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Notifications */}                <div className="relative">
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
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg border border-emerald-200/30 dark:border-emerald-700/30">                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <Icon className="fas fa-clock text-emerald-600 dark:text-emerald-400 text-sm" fallback="🕐" />
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>                {/* Mode sombre */}                <button
                  onClick={toggleTheme}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all duration-200 transform hover:scale-110"
                >
                  <Icon className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-slate-600'} transition-all duration-200 text-sm`} fallback={isDarkMode ? '☀️' : '🌙'} />
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
          </header>          {/* Contenu principal */}
          <main className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Bannière de bienvenue */}
            <section className="relative">
              <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-5 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full -ml-18 -mb-18"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Bienvenue dans votre Centre de Contrôle</h2>
                      <p className="text-blue-100 mb-4">Gérez votre banque avec intelligence et efficacité</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">Système Opérationnel</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className="fas fa-users text-xs"></i>
                          <span className="text-xs">{formatNumber(statsData.users.count)} utilisateurs actifs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className="fas fa-shield-alt text-xs"></i>
                          <span className="text-xs">Sécurité Maximale</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-chart-line text-4xl text-white/80"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>{/* Statistiques principales */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeInUp">              {/* Utilisateurs */}
              <div className="stat-card group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 gpu-accelerated">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-float">
                      <i className="fas fa-users text-white text-sm"></i>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatNumber(statsData.users.count)}</p>
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${statsData.users.trend === 'up' ? 'fa-arrow-up text-emerald-500' : 'fa-arrow-down text-red-500'} text-xs animate-pulse-soft`}></i>
                        <span className={`text-xs font-medium ${statsData.users.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {statsData.users.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Clients Actifs</h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full w-3/4 transition-all duration-1000 chart-bar"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">+{Math.floor(statsData.users.growth * 10)} nouveaux aujourd'hui</p>
                </div>
              </div>              {/* Comptes */}
              <div className="stat-card group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 gpu-accelerated">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0.5s'}}>
                      <i className="fas fa-piggy-bank text-white text-sm"></i>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatNumber(statsData.accounts.count)}</p>
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${statsData.accounts.trend === 'up' ? 'fa-arrow-up text-emerald-500' : 'fa-arrow-down text-red-500'} text-xs animate-pulse-soft`}></i>
                        <span className={`text-xs font-medium ${statsData.accounts.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {statsData.accounts.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Comptes Ouverts</h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full w-4/5 transition-all duration-1000 chart-bar"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">+{Math.floor(statsData.accounts.growth * 10)} cette semaine</p>
                </div>
              </div>

              {/* Transactions */}
              <div className="stat-card group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 gpu-accelerated">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>
                      <i className="fas fa-exchange-alt text-white text-sm"></i>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatNumber(statsData.transactions.count)}</p>
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${statsData.transactions.trend === 'up' ? 'fa-arrow-up text-emerald-500' : 'fa-arrow-down text-red-500'} text-xs animate-pulse-soft`}></i>
                        <span className={`text-xs font-medium ${statsData.transactions.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {Math.abs(statsData.transactions.growth)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Transactions</h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full w-5/6 transition-all duration-1000 chart-bar"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ce mois-ci</p>
                </div>
              </div>

              {/* Revenus */}
              <div className="stat-card group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 gpu-accelerated">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1.5s'}}>
                      <i className="fas fa-coins text-white text-sm"></i>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(statsData.revenue.count)}</p>
                      <div className="flex items-center space-x-1">
                        <i className={`fas ${statsData.revenue.trend === 'up' ? 'fa-arrow-up text-emerald-500' : 'fa-arrow-down text-red-500'} text-xs animate-pulse-soft`}></i>
                        <span className={`text-xs font-medium ${statsData.revenue.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {statsData.revenue.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Revenus</h3>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full w-4/5 transition-all duration-1000 chart-bar"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Performance mensuelle</p>
                </div>
              </div>
            </section>{/* Graphiques et activités */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activité récente */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Activité Récente</h3>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                    Voir tout
                  </button>
                </div>                <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-slate-600 dark:text-slate-400">Chargement...</span>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map((item, index) => (
                      <div key={index} className="group flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer gpu-accelerated animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 status-indicator`}>
                          <i className={`${item.icon} text-white`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-slate-400 dark:text-slate-500">Il y a {item.time}</span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity status-online"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                      <i className="fas fa-inbox text-4xl mb-4"></i>
                      <p className="text-sm">Aucune activité récente</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Graphique des performances */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Performance Globale</h3>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm">7j</button>
                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm">30j</button>
                  </div>
                </div>
                
                {/* Métriques de performance */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Satisfaction Client</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">98.5%</p>
                    <p className="text-xs text-emerald-600">+2.3% ce mois</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Temps de Réponse</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">1.2s</p>
                    <p className="text-xs text-purple-600">-0.3s optimisé</p>
                  </div>
                </div>                {/* Graphique simulé */}
                <div className="relative h-40 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-xl p-4 chart-container">
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between space-x-1">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((height, index) => (
                      <div key={index} className="relative group">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-sm w-6 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 cursor-pointer chart-bar gpu-accelerated"
                          style={{ height: `${height}%`, animationDelay: `${index * 0.1}s` }}
                        ></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity tooltip">
                          {height}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>            {/* Actions rapides */}
            <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Actions Rapides</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { icon: 'fas fa-user-plus', label: 'Nouveau Client', color: 'from-blue-500 to-blue-600' },
                  { icon: 'fas fa-credit-card', label: 'Ouvrir Compte', color: 'from-emerald-500 to-emerald-600' },
                  { icon: 'fas fa-file-alt', label: 'Générer Rapport', color: 'from-purple-500 to-purple-600' },
                  { icon: 'fas fa-cog', label: 'Paramètres', color: 'from-gray-500 to-gray-600' },
                  { icon: 'fas fa-bell', label: 'Notifications', color: 'from-orange-500 to-orange-600' },
                  { icon: 'fas fa-download', label: 'Exporter', color: 'from-red-500 to-red-600' }
                ].map((action, index) => (
                  <button key={index} className="btn-modern group flex flex-col items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 gpu-accelerated animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200 mb-2 animate-float`} style={{animationDelay: `${index * 0.2}s`}}>
                      <i className={`${action.icon} text-white text-xs`}></i>
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>          {/* Footer Moderne */}
          <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                  © 2025 BankAdmin Pro - Centre de contrôle bancaire
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Système opérationnel</span>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <i className="fas fa-code text-blue-500"></i>
                  <span>Version 3.2.1</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-clock text-purple-500"></i>
                  <span>Dernière sync: {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-server text-emerald-500"></i>
                  <span>Serveurs: 99.9% uptime</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;