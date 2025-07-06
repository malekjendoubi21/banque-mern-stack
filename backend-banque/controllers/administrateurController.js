const { Administrateur } = require('../models');
const bcrypt = require("bcryptjs");

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Administrateur.findAll();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminById = async (req, res) => {
    try {
        const admin = await Administrateur.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Administrateur non trouvé' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { nom, prenom, email, motdepasse } = req.body;

        // Vérifier si l'email existe déjà
        const existingAdmin = await Administrateur.findOne({ where: { email } });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Un administrateur avec cet email existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(motdepasse, 10);
        const newAdmin = await Administrateur.create({
            nom, 
            prenom, 
            email, 
            motdepasse: hashedPassword
        });

        res.status(201).json({ message: 'Administrateur créé avec succès', admin: newAdmin });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const admin = await Administrateur.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Administrateur non trouvé' });

        // Si un nouveau mot de passe est fourni, le hasher
        if (req.body.motdepasse) {
            req.body.motdepasse = await bcrypt.hash(req.body.motdepasse, 10);
        }

        await admin.update(req.body);
        res.json(admin);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Administrateur.findByPk(req.params.id);
        if (!admin) return res.status(404).json({ message: 'Administrateur non trouvé' });

        await admin.destroy();
        res.json({ message: 'Administrateur supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
