import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  // Vérifier si le chemin actuel correspond à un élément du menu
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Fonction pour basculer l'état du sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="admin-logo">
            <span className="logo-text">BanqueOnline</span>
            <span className="admin-badge">ADMIN</span>
          </div>
        </div>
        <div className="header-right">
          <div className="admin-profile">
            <div className="profile-dropdown">
              <span className="admin-name">Admin</span>
              <div className="dropdown-content">
                <Link to="/admin/profile" className="dropdown-item">Mon profil</Link>
                <Link to="/admin/settings" className="dropdown-item">Paramètres</Link>
                <button onClick={handleLogout} className="dropdown-item logout">Déconnexion</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="admin-content-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            <ul>
              <li className={isActive('/admin/dashboard') ? 'active' : ''}>
                <Link to="/admin/dashboard">
                  <i className="fas fa-tachometer-alt"></i>
                  <span>Tableau de bord</span>
                </Link>
              </li>
              <li className={isActive('/admin/users') ? 'active' : ''}>
                <Link to="/admin/users">
                  <i className="fas fa-users"></i>
                  <span>Utilisateurs</span>
                </Link>
              </li>
              <li className={isActive('/admin/accounts') ? 'active' : ''}>
                <Link to="/admin/accounts">
                  <i className="fas fa-credit-card"></i>
                  <span>Comptes</span>
                </Link>
              </li>
              <li className={isActive('/admin/transactions') ? 'active' : ''}>
                <Link to="/admin/transactions">
                  <i className="fas fa-exchange-alt"></i>
                  <span>Transactions</span>
                </Link>
              </li>
              <li className={isActive('/admin/transfers') ? 'active' : ''}>
                <Link to="/admin/transfers">
                  <i className="fas fa-paper-plane"></i>
                  <span>Virements</span>
                </Link>
              </li>
              <li className={isActive('/admin/reports') ? 'active' : ''}>
                <Link to="/admin/reports">
                  <i className="fas fa-chart-bar"></i>
                  <span>Rapports</span>
                </Link>
              </li>
              <li className={isActive('/admin/settings') ? 'active' : ''}>
                <Link to="/admin/settings">
                  <i className="fas fa-cog"></i>
                  <span>Paramètres</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`admin-main-content ${sidebarOpen ? '' : 'expanded'}`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} BanqueOnline. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
