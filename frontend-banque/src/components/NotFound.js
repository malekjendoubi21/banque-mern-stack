import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-animation">
          <div className="pulse-circle"></div>
          <div className="pulse-circle pulse-circle-2"></div>
          <div className="pulse-circle pulse-circle-3"></div>
        </div>
          <div className="not-found-text">
          <h1 className="not-found-title">🚧</h1>
          <h2 className="not-found-subtitle">En Cours de Développement</h2>
          <p className="not-found-description">
            Cette fonctionnalité est actuellement en développement. Nous travaillons dur pour vous l'apporter bientôt !
          </p>
          <div className="soon-badge">
            <span className="soon-text">COMING SOON</span>
            <div className="soon-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>        <div className="not-found-actions">
          <button onClick={handleGoBack} className="btn-primary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          
          <Link to="/" className="btn-secondary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Accueil
          </Link>
          
          <Link to="/client/dashboard" className="btn-secondary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </Link>
        </div><div className="not-found-footer">
          <p>🔧 Notre équipe développe de nouvelles fonctionnalités passionnantes pour améliorer votre expérience bancaire.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
