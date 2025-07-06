const { Virement, Compte, Transaction, Client, sequelize } = require('../models');

// Version temporaire qui fonctionne avec la structure actuelle de la DB
exports.createVirementTemp = async (req, res) => {
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
        }

        // Créer le virement avec seulement les champs qui existent
        const newVirement = await Virement.create({
            montant: numericMontant,
            datevirement: new Date() // Utiliser le nom de colonne actuel
        }, { transaction });

        // Mettre à jour les soldes
        const nouveauSoldeSource = parseFloat(sourceAccount.solde) - numericMontant;
        const nouveauSoldeDestination = parseFloat(destinationAccount.solde) + numericMontant;

        await sourceAccount.update({ solde: nouveauSoldeSource }, { transaction });
        await destinationAccount.update({ solde: nouveauSoldeDestination }, { transaction });

        // Créer les transactions associées
        await Transaction.create({
            type: 'virement_debit',
            montant: -numericMontant,
            description: `Virement vers ${destinationAccount.Client.nom} ${destinationAccount.Client.prenom} (${compteDestination})`,
            datetransaction: new Date(),
            idcompte: compteSource
        }, { transaction });

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

module.exports = { createVirementTemp };
