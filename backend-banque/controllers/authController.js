const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client, Administrateur } = require('../models');

const SECRET = process.env.JWT_SECRET || 'ton_jwt_secret';

// Générer token JWT avec id et userType
const generateToken = (user, userType) => {
    const userId = user.idclient || user.idadmin;
    return jwt.sign({ id: userId, userType }, SECRET, { expiresIn: '1h' });
};

// Inscription Client
exports.registerClient = async (req, res) => {
    try {
        const { nom, prenom, email, motdepasse } = req.body;
        const hashedPassword = await bcrypt.hash(motdepasse, 10);

        const newClient = await Client.create({
            nom,
            prenom,
            email,
            motdepasse: hashedPassword,
        });

        res.status(201).json({ message: 'Client enregistré', client: newClient });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Inscription Admin
exports.registerAdmin = async (req, res) => {
    try {
        const { nom, prenom, email, motdepasse } = req.body;
        const hashedPassword = await bcrypt.hash(motdepasse, 10);

        const newAdmin = await Administrateur.create({
            nom,
            prenom,
            email,
            motdepasse: hashedPassword,
        });

        res.status(201).json({ message: 'Administrateur enregistré', admin: newAdmin });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Connexion Client
exports.loginClient = async (req, res) => {
    try {
        const { email, motdepasse } = req.body;
        const client = await Client.findOne({ where: { email } });
        if (!client) return res.status(401).json({ message: 'Identifiants invalides' });

        const validPass = await bcrypt.compare(motdepasse, client.motdepasse);
        if (!validPass) return res.status(401).json({ message: 'Identifiants invalides' });

        const token = generateToken(client, 'client');
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Connexion Admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, motdepasse } = req.body;
        const admin = await Administrateur.findOne({ where: { email } });
        if (!admin) return res.status(401).json({ message: 'Identifiants invalides' });

        const validPass = await bcrypt.compare(motdepasse, admin.motdepasse);
        if (!validPass) return res.status(401).json({ message: 'Identifiants invalides' });

        const token = generateToken(admin, 'admin');
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Profil Client connecté
exports.getProfileClient = async (req, res) => {
    try {
        if (req.user.userType !== 'client') return res.status(403).json({ message: 'Accès refusé' });

        const client = await Client.findByPk(req.user.id);
        if (!client) return res.status(404).json({ message: 'Client introuvable' });

        res.json(client);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Profil Admin connecté
exports.getProfileAdmin = async (req, res) => {
    try {
        if (req.user.userType !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

        const admin = await Administrateur.findByPk(req.user.id);
        if (!admin) return res.status(404).json({ message: 'Administrateur introuvable' });

        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mot de passe oublié Client
exports.forgotPasswordClient = async (req, res) => {
    try {
        const { email, nouveauMotdepasse } = req.body;
        const client = await Client.findOne({ where: { email } });
        if (!client) return res.status(404).json({ message: 'Client introuvable' });

        client.motdepasse = await bcrypt.hash(nouveauMotdepasse, 10);
        await client.save();

        res.json({ message: 'Mot de passe du client mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mot de passe oublié Admin
exports.forgotPasswordAdmin = async (req, res) => {
    try {
        const { email, nouveauMotdepasse } = req.body;
        const admin = await Administrateur.findOne({ where: { email } });
        if (!admin) return res.status(404).json({ message: 'Administrateur introuvable' });

        admin.motdepasse = await bcrypt.hash(nouveauMotdepasse, 10);
        await admin.save();

        res.json({ message: 'Mot de passe de l\'administrateur mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
