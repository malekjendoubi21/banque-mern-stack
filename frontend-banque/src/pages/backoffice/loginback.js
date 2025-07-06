import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../utlis/api';
import './LoginBack.css';

const LoginBack = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    motdepasse: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Vérifier si des identifiants sont sauvegardés
    const savedEmail = localStorage.getItem('admin_remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login-admin', formData);
      
      // Sauvegarder l'email si "Se souvenir de moi" est coché
      if (rememberMe) {
        localStorage.setItem('admin_remembered_email', formData.email);
      } else {
        localStorage.removeItem('admin_remembered_email');
      }

      localStorage.setItem('admin_token', response.data.token);
      
      // Animation de succès avant redirection
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="admin-logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="login-title">
            Espace Administration
            <span className="admin-badge">Admin</span>
          </h2>
          <p className="login-subtitle">
            Connectez-vous avec vos identifiants administrateur
          </p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="admin@banque.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="motdepasse" className="form-label">
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="motdepasse"
                id="motdepasse"
                required
                value={formData.motdepasse}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex-between">
            <div className="remember-me">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember_me" className="form-label" style={{ marginBottom: '0', fontSize: '0.875rem' }}>
                Se souvenir de moi
              </label>
            </div>

            <div>
              <Link to="/admin/mot-de-passe-oublie" className="login-link">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div className="form-group">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading && <span className="loading-spinner"></span>}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/" className="login-link">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>

      <div className="footer-text">
        <p>
          🔒 Espace réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
};

export default LoginBack;
