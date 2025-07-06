import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../utlis/api';

// Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const AccountsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const ClientLayout = ({ children }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/client/login');
          return;
        }

        const userResponse = await API.get('auth/profile-client');
        setUserData(userResponse.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        localStorage.removeItem('token');
        navigate('/client/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/client/login');
  };

  const isActive = (path) => location.pathname === path;  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50'}`}>
      {/* Header */}
      <header className="navbar-modern fixed top-0 left-0 right-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="nav-toggle md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/client/dashboard" className="logo-brand group">
              <div className="flex items-center space-x-3">
                <div className="logo-icon">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>                <div>
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
                    Banque<span className="text-accent-500">Online</span>
                  </span>
                  <div className="text-xs text-adaptive-secondary opacity-75 hidden md:block">
                    Votre banque digitale
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleDarkMode} 
              className="theme-toggle group"
              aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              title={`Mode actuel: ${darkMode ? 'Sombre' : 'Clair'}`}
            >
              <div className="theme-icon">
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </div>
              <span className="theme-label hidden lg:block">
                {darkMode ? 'Mode Clair' : 'Mode Sombre'}
              </span>
            </button>

            {userData && (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                  className="profile-button group"
                >
                  <div className="hidden md:block text-right mr-3">
                    <p className="profile-name">{userData.prenom} {userData.nom}</p>
                    <p className="profile-email">{userData.email}</p>
                  </div>
                  <div className="profile-avatar">
                    <div className="avatar-initials">
                      {userData.prenom?.charAt(0)}{userData.nom?.charAt(0)}
                    </div>
                    <div className="avatar-status"></div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="profile-dropdown animate-scale-in">
                    <Link 
                      to="/client/profile" 
                      className="dropdown-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <ProfileIcon />
                      <span className="ml-3">Mon profil</span>
                      <svg className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogoutIcon />
                      <span className="ml-3">Déconnexion</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>      </header>

      {/* Content Area */}
      <div className="pt-20">
        {/* Mobile Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`sidebar-modern ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-out`}
        >
          <div className="sidebar-content">
            <div className="sidebar-header">
              <h3 className="text-lg font-semibold text-adaptive-strong mb-2">
                Navigation
              </h3>
              <div className="text-sm text-adaptive-secondary">
                Gérez votre compte
              </div>
            </div>

            <nav className="sidebar-nav">
              <Link 
                to="/client/dashboard"
                className={`nav-item ${
                  isActive('/client/dashboard') ? 'nav-item-active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="nav-icon bg-gradient-to-r from-blue-500 to-blue-600">
                  <DashboardIcon />
                </div>
                <div className="nav-content">
                  <span className="nav-label">Tableau de bord</span>
                  <span className="nav-description">Vue d'ensemble</span>
                </div>
                {isActive('/client/dashboard') && <div className="nav-indicator"></div>}
              </Link>
              
              <Link 
                to="/client/comptes"
                className={`nav-item ${
                  isActive('/client/comptes') ? 'nav-item-active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="nav-icon bg-gradient-to-r from-green-500 to-green-600">
                  <AccountsIcon />
                </div>
                <div className="nav-content">
                  <span className="nav-label">Mes comptes</span>
                  <span className="nav-description">Gestion des comptes</span>
                </div>
                {isActive('/client/comptes') && <div className="nav-indicator"></div>}
              </Link>
              
              <Link 
                to="/client/profile"
                className={`nav-item ${
                  isActive('/client/profile') ? 'nav-item-active' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="nav-icon bg-gradient-to-r from-purple-500 to-purple-600">
                  <ProfileIcon />
                </div>
                <div className="nav-content">
                  <span className="nav-label">Mon profil</span>
                  <span className="nav-description">Informations personnelles</span>
                </div>
                {isActive('/client/profile') && <div className="nav-indicator"></div>}
              </Link>
            </nav>
          </div>
          
          <div className="sidebar-footer">
            <button 
              onClick={handleLogout}
              className="logout-button group w-full"
            >
              <div className="logout-icon">
                <LogoutIcon />
              </div>
              <div className="logout-content">
                <span className="logout-label">Déconnexion</span>
                <span className="logout-description">Quitter votre session</span>
              </div>
              <svg className="h-5 w-5 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
