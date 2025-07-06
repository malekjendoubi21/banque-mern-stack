import React, { useState } from 'react';
import './RegisterForms.css';

const RegisterForms = () => {
    const [showClientForm, setShowClientForm] = useState(false);
    const [showAdminForm, setShowAdminForm] = useState(false);
    const [clientData, setClientData] = useState({
        nom: '',
        prenom: '',
        email: '',
        motdepasse: ''
    });
    const [adminData, setAdminData] = useState({
        nom: '',
        prenom: '',
        email: '',
        motdepasse: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleClientInputChange = (e) => {
        setClientData({
            ...clientData,
            [e.target.name]: e.target.value
        });
    };

    const handleAdminInputChange = (e) => {
        setAdminData({
            ...adminData,
            [e.target.name]: e.target.value
        });
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/register-client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clientData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setMessage('Client enregistré avec succès !');
                setClientData({ nom: '', prenom: '', email: '', motdepasse: '' });
                setTimeout(() => setShowClientForm(false), 2000);
            } else {
                setMessage(result.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            setMessage('Erreur de connexion au serveur');
        }
        setLoading(false);
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/register-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adminData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setMessage('Administrateur enregistré avec succès !');
                setAdminData({ nom: '', prenom: '', email: '', motdepasse: '' });
                setTimeout(() => setShowAdminForm(false), 2000);
            } else {
                setMessage(result.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            setMessage('Erreur de connexion au serveur');
        }
        setLoading(false);
    };

    const toggleClientForm = () => {
        setShowClientForm(!showClientForm);
        setShowAdminForm(false);
        setMessage('');
    };

    const toggleAdminForm = () => {
        setShowAdminForm(!showAdminForm);
        setShowClientForm(false);
        setMessage('');
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Inscription</h2>
            
            <div className="button-group">
                <button 
                    className={`toggle-btn client-btn ${showClientForm ? 'active' : ''}`}
                    onClick={toggleClientForm}
                >
                    {showClientForm ? 'Masquer' : 'Inscription Client'}
                </button>
                
                <button 
                    className={`toggle-btn admin-btn ${showAdminForm ? 'active' : ''}`}
                    onClick={toggleAdminForm}
                >
                    {showAdminForm ? 'Masquer' : 'Inscription Admin'}
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            {/* Formulaire Client */}
            {showClientForm && (
                <div className="form-container client-form">
                    <h3>Inscription Client</h3>
                    <form onSubmit={handleClientSubmit}>
                        <div className="form-group">
                            <label htmlFor="client-nom">Nom:</label>
                            <input
                                type="text"
                                id="client-nom"
                                name="nom"
                                value={clientData.nom}
                                onChange={handleClientInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="client-prenom">Prénom:</label>
                            <input
                                type="text"
                                id="client-prenom"
                                name="prenom"
                                value={clientData.prenom}
                                onChange={handleClientInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="client-email">Email:</label>
                            <input
                                type="email"
                                id="client-email"
                                name="email"
                                value={clientData.email}
                                onChange={handleClientInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="client-password">Mot de passe:</label>
                            <input
                                type="password"
                                id="client-password"
                                name="motdepasse"
                                value={clientData.motdepasse}
                                onChange={handleClientInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="submit-btn client-submit"
                            disabled={loading}
                        >
                            {loading ? 'Inscription...' : 'S\'inscrire'}
                        </button>
                    </form>
                </div>
            )}

            {/* Formulaire Admin */}
            {showAdminForm && (
                <div className="form-container admin-form">
                    <h3>Inscription Administrateur</h3>
                    <form onSubmit={handleAdminSubmit}>
                        <div className="form-group">
                            <label htmlFor="admin-nom">Nom:</label>
                            <input
                                type="text"
                                id="admin-nom"
                                name="nom"
                                value={adminData.nom}
                                onChange={handleAdminInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="admin-prenom">Prénom:</label>
                            <input
                                type="text"
                                id="admin-prenom"
                                name="prenom"
                                value={adminData.prenom}
                                onChange={handleAdminInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="admin-email">Email:</label>
                            <input
                                type="email"
                                id="admin-email"
                                name="email"
                                value={adminData.email}
                                onChange={handleAdminInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="admin-password">Mot de passe:</label>
                            <input
                                type="password"
                                id="admin-password"
                                name="motdepasse"
                                value={adminData.motdepasse}
                                onChange={handleAdminInputChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="submit-btn admin-submit"
                            disabled={loading}
                        >
                            {loading ? 'Inscription...' : 'S\'inscrire'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default RegisterForms;
