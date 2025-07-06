const { Client, Administrateur } = require('../models');
const bcrypt = require("bcryptjs");

// Get all clients
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get client by id
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client non trouvé' });
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create client
exports.createClient = async (req, res) => {
    try {
        const { nom, prenom, email, motdepasse, telephone, adresse } = req.body;

        // Vérifier si l'email existe déjà
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
            return res.status(400).json({ error: 'Un client avec cet email existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(motdepasse, 10);
        const newClient = await Client.create({
            nom, 
            prenom, 
            email, 
            motdepasse: hashedPassword,
            telephone: telephone || null,
            adresse: adresse || null
        });

        res.status(201).json({ message: 'Client créé avec succès', client: newClient });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update client
exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client non trouvé' });

        // Si un nouveau mot de passe est fourni, le hasher
        if (req.body.motdepasse) {
            req.body.motdepasse = await bcrypt.hash(req.body.motdepasse, 10);
        }

        await client.update(req.body);
        res.json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete client
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client non trouvé' });

        await client.destroy();
        res.json({ message: 'Client supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users (clients + administrators)
exports.getAllUsers = async (req, res) => {
    try {        // Récupérer tous les clients
        const clients = await Client.findAll({
            attributes: ['idclient', 'nom', 'prenom', 'email', 'telephone', 'adresse', 'dateinscription']
        });
          // Récupérer tous les administrateurs
        const administrateurs = await Administrateur.findAll({
            attributes: ['idadmin', 'nom', 'prenom', 'email']
        });
          // Formater les données pour avoir une structure uniforme
        const formattedClients = clients.map(client => ({
            id: client.idclient,
            nom: client.nom,
            prenom: client.prenom,
            email: client.email,
            telephone: client.telephone,
            adresse: client.adresse,
            actif: client.actif,
            role: 'client',
            dateinscription: client.dateinscription
        }));
        
        const formattedAdministrateurs = administrateurs.map(admin => ({
            id: admin.idadmin,
            nom: admin.nom,
            prenom: admin.prenom,
            email: admin.email,
            telephone: null,
            adresse: null,
            actif: true, // Les admins sont toujours actifs
            role: 'administrateur',
            dateCreation: null // Les admins n'ont pas de date de création dans le modèle actuel
        }));
        
        // Combiner les deux listes
        const allUsers = [...formattedClients, ...formattedAdministrateurs];
        
        // Trier par nom
        allUsers.sort((a, b) => a.nom.localeCompare(b.nom));
        
        res.json(allUsers);
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        res.status(500).json({ error: error.message });
    }
};
