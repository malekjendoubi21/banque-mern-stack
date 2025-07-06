const { Virement, Compte, Transaction, Client, sequelize } = require('../models');

exports.getAllVirements = async (req, res) => {
    try {
        const virements = await Virement.findAll({
            include: [
                {
                    model: Compte,
                    as: 'CompteSource',
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        }
                    ]
                },
                {
                    model: Compte,
                    as: 'CompteDestination',
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        }
                    ]
                },
                {
                    model: Transaction,
                    required: false
                }
            ],
            order: [['datetransfert', 'DESC']]
        });
        res.json(virements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVirementById = async (req, res) => {
    try {
        const virement = await Virement.findByPk(req.params.id, {
            include: [
                {
                    model: Compte,
                    as: 'CompteSource',
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        }
                    ]
                },
                {
                    model: Compte,
                    as: 'CompteDestination',
                    include: [
                        {
                            model: Client,
                            attributes: ['idclient', 'nom', 'prenom', 'email']
                        }
                    ]
                },
                {
                    model: Transaction,
                    required: false
                }
            ]
        });
        
        if (!virement) return res.status(404).json({ message: 'Virement non trouvé' });
        res.json(virement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createVirement = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { compteSource, compteDestination, montant, description } = req.body;
        
        // Validation des données
        if (!compteSource || !compteDestination || !montant) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Données manquantes' });
        }

        const numericMontant = parseFloat(montant);
        if (isNaN(numericMontant) || numericMontant <= 0) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Montant invalide' });
        }

        // Vérifier que les comptes existent et sont actifs
        const sourceAccount = await Compte.findOne({
            where: { idcompte: compteSource, etat: 'active' },
            include: [{
                model: Client,
                attributes: ['idclient', 'nom', 'prenom']
            }],
            transaction
        });

        const destinationAccount = await Compte.findOne({
            where: { idcompte: compteDestination, etat: 'active' },
            include: [{
                model: Client,
                attributes: ['idclient', 'nom', 'prenom']
            }],
            transaction
        });

        if (!sourceAccount) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Compte source non trouvé ou inactif' });
        }

        if (!destinationAccount) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Compte destinataire non trouvé ou inactif' });
        }

        // Vérifier que l'utilisateur connecté est propriétaire du compte source
        if (req.user && sourceAccount.idclient !== req.user.id) {
            await transaction.rollback();
            return res.status(403).json({ message: 'Vous ne pouvez pas effectuer un virement depuis ce compte' });
        }

        // Vérifier le solde suffisant
        if (parseFloat(sourceAccount.solde) < numericMontant) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Solde insuffisant' });
        }

        // Empêcher les virements vers le même compte
        if (compteSource === compteDestination) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Impossible de faire un virement vers le même compte' });
        }        // Créer d'abord une transaction pour le débit (optionnel selon votre logique)
        const transactionDebit = await Transaction.create({
            type: 'virement_debit',
            montant: -numericMontant,
            description: `Virement vers ${destinationAccount.Client.nom} ${destinationAccount.Client.prenom} (${compteDestination})`,
            datetransaction: new Date(),
            idcompte: compteSource
        }, { transaction });

        // Créer le virement avec les noms de colonnes corrects
        const newVirement = await Virement.create({
            comptesource: compteSource,
            comptedestination: compteDestination,
            montant: numericMontant,
            datevirement: new Date(),
            idtransaction: transactionDebit.idtransaction
        }, { transaction });

        // Mettre à jour les soldes
        const nouveauSoldeSource = parseFloat(sourceAccount.solde) - numericMontant;
        const nouveauSoldeDestination = parseFloat(destinationAccount.solde) + numericMontant;

        await sourceAccount.update({ solde: nouveauSoldeSource }, { transaction });
        await destinationAccount.update({ solde: nouveauSoldeDestination }, { transaction });

        // Créer la transaction pour le crédit
        await Transaction.create({
            type: 'virement_credit',
            montant: numericMontant,
            description: `Virement reçu de ${sourceAccount.Client.nom} ${sourceAccount.Client.prenom} (${compteSource})`,
            datetransaction: new Date(),
            idcompte: compteDestination
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Virement effectué avec succès',
            virement: newVirement,
            nouveauSoldeSource,
            nouveauSoldeDestination
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Erreur lors du virement:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateVirement = async (req, res) => {
    try {
        const virement = await Virement.findByPk(req.params.id);
        if (!virement) return res.status(404).json({ message: 'Virement non trouvé' });

        await virement.update(req.body);
        res.json(virement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteVirement = async (req, res) => {
    try {
        const virement = await Virement.findByPk(req.params.id);
        if (!virement) return res.status(404).json({ message: 'Virement non trouvé' });

        await virement.destroy();
        res.json({ message: 'Virement supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
