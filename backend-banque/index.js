const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const { sequelize } = require('./models'); // importe l'instance sequelize

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
    origin: 'http://localhost:3001', // L'URL de votre frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Pour les webhooks Stripe, nous devons traiter le body en raw avant express.json()
app.use('/api/comptes/webhook', express.raw({type: 'application/json'}));

// Route pour le webhook Stripe (doit être avant express.json())
app.post('/api/comptes/webhook', require('./controllers/compteController').handleStripeWebhook);

app.use(express.json());

const clientRoutes = require('./routes/clientRoutes');
const administrateurRoutes = require('./routes/administrateurRoutes');
const compteRoutes = require('./routes/compteRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const virementRoutes = require('./routes/virementRoutes');
const authRoutes = require('./routes/authRoutes');
const stripeCallbackRoutes = require('./routes/stripeCallbackRoutes');

app.use('/api/clients', clientRoutes);
app.use('/api/administrateurs', administrateurRoutes);
app.use('/api/comptes', compteRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/virements', virementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stripe-callback', stripeCallbackRoutes);

// Test connexion base de données avant démarrage serveur
sequelize.authenticate()
    .then(() => {
        console.log('Connexion à la base de données réussie.');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Serveur démarré sur le port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Impossible de se connecter à la base de données:', err);
    });
