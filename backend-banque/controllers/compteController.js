const { Compte, Client } = require('../models');
const { Op } = require('sequelize');
const Stripe = require('stripe');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
exports.getAllComptes = async (req, res) => {
    try {
        console.log('Tentative de récupération des comptes...');
        
        // Récupérer les comptes avec les informations des clients
        const comptes = await Compte.findAll({
            include: [
                {
                    model: Client,
                    attributes: ['idclient', 'nom', 'prenom', 'email', 'telephone'],
                    required: false // LEFT JOIN au lieu d'INNER JOIN
                }
            ]
        });
        
        console.log('Comptes récupérés avec inclusion:', comptes.length);
        if (comptes.length > 0) {
            console.log('Premier compte avec client:', JSON.stringify(comptes[0], null, 2));
        }
        
        res.json(comptes);
    } catch (error) {
        console.error('Erreur getAllComptes:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getCompteById = async (req, res) => {
    try {
        const compte = await Compte.findOne({ 
            where: { idcompte: req.params.id },
            include: [
                {
                    model: Client,
                    attributes: ['idclient', 'nom', 'prenom', 'email', 'phone']
                }
            ]
        });
        if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });
        res.json(compte);
    } catch (error) {
        console.error('Erreur getCompteById:', error);
        res.status(500).json({ error: error.message });
    }
};
/*
exports.createCompte = async (req, res) => {
    try {
        const compteData = { ...req.body };

        compteData.etat = 'pending';

        compteData.idcompte = await generateUniqueIdCompte();

        const newCompte = await Compte.create(compteData);
        res.status(201).json(newCompte);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};*/
exports.createCompte = async (req, res) => {
    try {
        const idclient = req.user.id; // ← ID du client connecté (authentifié)
        const compteData = {
            ...req.body,
            idclient: idclient,
            idadmin: null, // ← Admin non concerné à la création
            etat: 'pending',
            idcompte: await generateUniqueIdCompte()
        };

        const newCompte = await Compte.create(compteData);
        res.status(201).json(newCompte);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCompte = async (req, res) => {
    try {
        const compte = await Compte.findOne({ where: { idcompte: req.params.id } });
        if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });

        const idadmin = req.user.id; // ← ID de l'admin connecté

        const updatedData = {
            ...req.body,
            idadmin: idadmin
        };

        await compte.update(updatedData);
        res.json(compte);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/*
exports.updateCompte = async (req, res) => {
    try {
        const compte = await Compte.findByPk(req.params.id);
        if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });

        await compte.update(req.body);
        res.json(compte);
    } catch (error) {
        res.status(400
    }
};*/

exports.deleteCompte = async (req, res) => {
    try {
        const compte = await Compte.findOne({ where: { idcompte: req.params.id } });
        if (!compte) return res.status(404).json({ message: 'Compte non trouvé' });

        await compte.destroy();
        res.json({ message: 'Compte supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateEtatCompte = async (req, res) => {
    try {
        const compteId = req.params.id; // id du compte
        const { etat } = req.body; // nouvel état
        const idadmin = req.user.id; // id admin connecté (depuis token)

        // Vérifier que l'état est valide
        const etatsValides = ['pending', 'active', 'rejected'];
        if (!etatsValides.includes(etat)) {
            return res.status(400).json({ message: 'État invalide' });
        }

        // Trouver le compte
        const compte = await Compte.findOne({ where: { idcompte: compteId } });
        if (!compte) {
            return res.status(404).json({ message: 'Compte non trouvé' });
        }

        // Mettre à jour l'état ET l'idadmin qui fait la modification
        compte.etat = etat;
        compte.idadmin = idadmin;

        await compte.save();

        res.json({ message: 'État mis à jour avec succès', compte });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l’état' });
    }
};

async function generateUniqueIdCompte() {
    const prefix = 'TN';

    const generate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        return `${prefix}${year}${month}${day}${hours}${minutes}${seconds}${randomDigits}`;
    };

    let id;
    let exists = true;

    // Loop until an unused id is found
    do {
        id = generate();
        const existing = await Compte.findOne({ where: { idcompte: id } });
        exists = !!existing;
    } while (exists);

    return id;
}
exports.getComptesDuClientConnecte = async (req, res) => {
    try {
        const idclient = req.user.id;

        const comptes = await Compte.findAll({
            where: { idclient }
        });

        res.json(comptes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.rechargerCompte = async (req, res) => {
    const { idcompte, montant, paymentMethodId } = req.body;

    try {
        const compte = await Compte.findByPk(idcompte);
        if (!compte) return res.status(404).json({ message: "Compte introuvable." });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(montant * 100), 
            currency: 'eur', // ou 'usd' selon votre besoin
            payment_method: paymentMethodId,
            confirm: true
        });

        if (paymentIntent.status === 'succeeded') {
            compte.solde = parseFloat(compte.solde) + parseFloat(montant);
            await compte.save();

            res.status(200).json({ message: "Recharge réussie", compte });
        } else {
            res.status(400).json({ message: "Paiement échoué", stripeResponse: paymentIntent });
        }

    } catch (error) {
        res.status(500).json({ message: "Erreur lors du paiement ou de la mise à jour du solde", error: error.message });
    }
};

exports.createCheckoutSession = async (req, res) => {
    try {
        const { compteId, amount } = req.body;
        const userId = req.user.id;

        // Vérifier que le compte appartient à l'utilisateur
        const compte = await Compte.findOne({
            where: { idcompte: compteId },
            include: [{
                model: Client,
                where: { idclient: userId }
            }]
        });

        if (!compte) {
            return res.status(404).json({ message: 'Compte non trouvé' });
        }

        // Valider le montant
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ message: 'Montant invalide' });
        }

        // Créer la session Stripe Checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Recharge compte ${compte.typecompte}`,
                        description: `Recharge du compte ${compte.idcompte}`,
                    },
                    unit_amount: Math.round(numericAmount * 100), // Stripe utilise les centimes
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/mes-comptes?success=true&session_id={CHECKOUT_SESSION_ID}&compte_id=${compteId}&amount=${numericAmount}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/mes-comptes?canceled=true`,
            metadata: {
                compteId: compteId.toString(),
                amount: numericAmount.toString(),
                userId: userId.toString()
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la session de paiement' });
    }
};

exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Tenter de construire l'événement avec la signature
        if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== 'whsec_test_webhook_secret_for_development') {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } else {
            // En mode développement, accepter le corps sans vérification
            event = JSON.parse(req.body.toString());
            console.log('Mode développement: vérification de signature de webhook ignorée');
        }
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Gérer l'événement
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            const { compteId, amount } = session.metadata;
            
            // Mettre à jour le solde du compte
            const compte = await Compte.findOne({
                where: { idcompte: compteId }
            });

            if (compte) {
                compte.solde = parseFloat(compte.solde) + parseFloat(amount);
                await compte.save();
                
                console.log(`Compte ${compteId} rechargé avec succès de ${amount}€`);
            } else {
                console.error(`Compte ${compteId} non trouvé pour le webhook`);
            }
        } catch (error) {
            console.error('Erreur lors du traitement du webhook:', error);
        }
    }
    
    res.json({ received: true });
};

// Rechercher un compte pour virement et retourner les infos du propriétaire
exports.searchCompteForVirement = async (req, res) => {
    try {
        const { numeroCompte } = req.params;
        
        // Rechercher le compte avec les informations du client propriétaire
        const compte = await Compte.findOne({
            where: { 
                idcompte: numeroCompte,
                etat: 'active' // Seuls les comptes actifs peuvent recevoir des virements
            },
            include: [{
                model: Client,
                attributes: ['nom', 'prenom', 'email']
            }]
        });

        if (!compte) {
            return res.status(404).json({ message: 'Compte non trouvé ou inactif' });
        }

        // S'assurer qu'on ne peut pas faire un virement vers son propre compte
        if (compte.idclient === req.user.id) {
            return res.status(400).json({ message: 'Impossible de faire un virement vers votre propre compte' });
        }

        // Retourner les informations nécessaires
        res.json({
            idcompte: compte.idcompte,
            typecompte: compte.typecompte,
            nom: compte.Client.nom,
            prenom: compte.Client.prenom,
            email: compte.Client.email
        });
    } catch (error) {
        console.error('Erreur lors de la recherche du compte:', error);
        res.status(500).json({ error: error.message });
    }
};

// Statistiques pour le dashboard admin
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Récupération des statistiques du dashboard...');
        
        // Récupérer le nombre de clients
        const usersCount = await Client.count();
        
        // Récupérer le nombre de comptes
        const accountsCount = await Compte.count();
        
        // Récupérer le nombre de transactions et virements
        const { Transaction, Virement } = require('../models');
        const transactionsCount = await Transaction.count();
        const virementsCount = await Virement.count();
        const totalTransactions = transactionsCount + virementsCount;
        
        // Calculer la somme de tous les soldes des comptes
        const totalSoldes = await Compte.sum('solde') || 0;
        
        // Récupérer les activités récentes
        const recentActivities = [];
        
        // Récupérer les transactions récentes
        try {
            const recentTransactions = await Transaction.findAll({
                limit: 3,
                order: [['datetransaction', 'DESC']],
                include: [
                    {
                        model: Compte,
                        attributes: ['idcompte', 'typecompte'],
                        include: [
                            {
                                model: Client,
                                attributes: ['nom', 'prenom']
                            }
                        ]
                    }
                ]
            });
            
            recentTransactions.forEach(transaction => {
                const client = transaction.Compte?.Client;
                recentActivities.push({
                    type: 'transaction',
                    icon: 'fas fa-money-bill-wave',
                    color: 'from-orange-500 to-orange-600',
                    title: `Transaction de ${transaction.montant}€`,
                    subtitle: client ? `${client.nom} ${client.prenom}` : 'Client inconnu',
                    time: getTimeAgo(transaction.datetransaction),
                    date: transaction.datetransaction
                });
            });
        } catch (error) {
            console.log('Erreur récupération transactions:', error.message);
        }
        
        // Récupérer les comptes récents
        try {
            const recentAccounts = await Compte.findAll({
                limit: 3,
                order: [['datecreation', 'DESC']],
                include: [
                    {
                        model: Client,
                        attributes: ['nom', 'prenom']
                    }
                ]
            });
            
            recentAccounts.forEach(compte => {
                const client = compte.Client;
                recentActivities.push({
                    type: 'account',
                    icon: 'fas fa-credit-card',
                    color: 'from-emerald-500 to-emerald-600',
                    title: 'Nouveau compte ouvert',
                    subtitle: client ? `${client.nom} ${client.prenom} - ${compte.typecompte}` : 'Client inconnu',
                    time: getTimeAgo(compte.datecreation),
                    date: compte.datecreation
                });
            });
        } catch (error) {
            console.log('Erreur récupération comptes:', error.message);
        }
        
        // Récupérer les clients récents
        try {
            const recentClients = await Client.findAll({
                limit: 2,
                order: [['datedenaissance', 'DESC']] // ou utilisez un autre champ de date si disponible
            });
            
            recentClients.forEach(client => {
                recentActivities.push({
                    type: 'client',
                    icon: 'fas fa-user-plus',
                    color: 'from-blue-500 to-blue-600',
                    title: 'Nouveau client inscrit',
                    subtitle: `${client.nom} ${client.prenom}`,
                    time: getTimeAgo(client.datedenaissance), // ou utilisez la date d'inscription si disponible
                    date: client.datedenaissance
                });
            });
        } catch (error) {
            console.log('Erreur récupération clients:', error.message);
        }
        
        // Trier par date décroissante et prendre les 5 plus récents
        recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({
            users: { count: usersCount },
            accounts: { count: accountsCount },
            transactions: { count: totalTransactions },
            revenue: { count: totalSoldes },
            recentActivities: recentActivities.slice(0, 5)
        });
        
    } catch (error) {
        console.error('Erreur getDashboardStats:', error);
        res.status(500).json({ error: error.message });
    }
};

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "à l'instant";
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
}