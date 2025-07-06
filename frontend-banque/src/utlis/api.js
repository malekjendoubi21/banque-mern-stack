import axios from 'axios';

// ✅ Définir l'URL de base de ton backend
const API = axios.create({
    baseURL: 'http://localhost:3000/api', // ajuste le port si nécessaire
});

// ✅ Ajouter automatiquement le token JWT à chaque requête si présent
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // stocké après login
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;