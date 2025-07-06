const { Transaction, Compte, Client, Administrateur } = require('../models');

exports.getAllTransactions = async (req, res) => {
    try {
        let whereClause = {};
        
        // Filtrer par idcompte si fourni dans les paramètres de requête
        if (req.query.idcompte) {
            whereClause.idcompte = req.query.idcompte;
        }
        
        // Filtrer par type si fourni dans les paramètres de requête
        if (req.query.type) {
            whereClause.type = req.query.type;
        }

        const transactions = await Transaction.findAll({
            where: whereClause,
            include: [
                {
                    model: Compte,
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        },
                        {
                            model: Administrateur,
                            attributes: ['idadmin', 'nom', 'prenom', 'email'],
                            required: false
                        }
                    ],
                    required: false
                },
                {
                    model: Administrateur,
                    attributes: ['idadmin', 'nom', 'prenom', 'email'],
                    required: false
                }
            ],
            order: [['datetransaction', 'DESC']] // Trier par date décroissante
        });
        
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: [
                {
                    model: Compte,
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        },
                        {
                            model: Administrateur,
                            attributes: ['idadmin', 'nom', 'prenom', 'email'],
                            required: false
                        }
                    ],
                    required: false
                },
                {
                    model: Administrateur,
                    attributes: ['idadmin', 'nom', 'prenom', 'email'],
                    required: false
                }
            ]
        });
        
        if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const newTransaction = await Transaction.create(req.body);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });

        await transaction.update(req.body);
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });

        await transaction.destroy();
        res.json({ message: 'Transaction supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionsByAccount = async (req, res) => {
    try {
        const { idcompte } = req.params;
        
        const transactions = await Transaction.findAll({
            where: { idcompte },
            order: [['datetransaction', 'DESC']]
        });
        
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTransactionTypes = async (req, res) => {
    try {
        // Définir les types de transactions disponibles
        const transactionTypes = [
            { value: 'depot', label: 'Dépôt' },
            { value: 'retrait', label: 'Retrait' },
            { value: 'virement_entrant', label: 'Virement entrant' },
            { value: 'virement_sortant', label: 'Virement sortant' },
            { value: 'paiement', label: 'Paiement' },
            { value: 'recharge', label: 'Recharge' },
            { value: 'frais', label: 'Frais bancaires' },
            { value: 'interest', label: 'Intérêts' }
        ];
        
        res.json(transactionTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
