import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/frontoffice/login';
import LoginBack from './pages/backoffice/loginback';
import Dashboard from './pages/frontoffice/Dashboard';
import Profile from './pages/frontoffice/profile';
import ListUsers from './pages/backoffice/listUsers';
import DashboardAdmin from './pages/backoffice/DashboardAdmin';
import ListAccounts from './pages/backoffice/ListAccounts';
import ListTransactions from './pages/backoffice/ListTransactions';
import MesComptes  from './pages/frontoffice/MesComptes';
import DetailCompte from './pages/frontoffice/DetailCompte';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminThemeProvider } from './contexts/AdminThemeContext';
import AdminWrapper from './components/AdminWrapper';
import NotFound from './components/NotFound';

function App() {
  return (
    <ThemeProvider>
      <AdminThemeProvider>
        <Router>
          <div className="App">
            <Routes>
            <Route path="/client/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/client/dashboard" element={<Dashboard />} />
            <Route path="/client/profile" element={<Profile />} />
            <Route path="/client/comptes" element={<MesComptes  />} />
            <Route path="/mes-comptes" element={<MesComptes  />} />
            <Route path="/account/:id" element={<DetailCompte />} />

            <Route path="/admin/login" element={<LoginBack />} />
            <Route path="/admin/dashboard" element={<AdminWrapper><DashboardAdmin /></AdminWrapper>} />
            <Route path="/admin/users" element={<AdminWrapper><ListUsers /></AdminWrapper>} />
            <Route path="/admin/accounts" element={<AdminWrapper><ListAccounts /></AdminWrapper>} />
            <Route path="/admin/transactions" element={<AdminWrapper><ListTransactions /></AdminWrapper>} />
            {/* Route catch-all pour les pages non trouvées */}
            <Route path="*" element={<NotFound />} />
            {/* Ajoutez d'autres routes ici */}
          </Routes>
        </div>
      </Router>
      </AdminThemeProvider>
    </ThemeProvider>
  );
}

export default App;
