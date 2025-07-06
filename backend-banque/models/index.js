// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const ClientModel = require('./Client');
const AdministrateurModel = require('./Administrateur');
const CompteModel = require('./Compte');
const TransactionModel = require('./Transaction');
const VirementModel = require('./Virement');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

// Initialisation des modèles avec la connexion sequelize et DataTypes
const Client = ClientModel(sequelize, DataTypes);
const Administrateur = AdministrateurModel(sequelize, DataTypes);
const Compte = CompteModel(sequelize, DataTypes);
const Transaction = TransactionModel(sequelize, DataTypes);
const Virement = VirementModel(sequelize, DataTypes);

// Définition des relations
Client.hasMany(Compte, { foreignKey: 'idclient' });
Compte.belongsTo(Client, { foreignKey: 'idclient' });

Administrateur.hasMany(Compte, { foreignKey: 'idadmin' });
Compte.belongsTo(Administrateur, { foreignKey: 'idadmin' });

Compte.hasMany(Transaction, { foreignKey: 'idcompte' });
Transaction.belongsTo(Compte, { foreignKey: 'idcompte' });

Administrateur.hasMany(Transaction, { foreignKey: 'idadmin' });
Transaction.belongsTo(Administrateur, { foreignKey: 'idadmin' });

// Relations pour les virements avec les comptes
Compte.hasMany(Virement, { foreignKey: 'comptesource', sourceKey: 'idcompte', as: 'VirementsSource' });
Virement.belongsTo(Compte, { foreignKey: 'comptesource', targetKey: 'idcompte', as: 'CompteSource' });

Compte.hasMany(Virement, { foreignKey: 'comptedestination', sourceKey: 'idcompte', as: 'VirementsDestination' });
Virement.belongsTo(Compte, { foreignKey: 'comptedestination', targetKey: 'idcompte', as: 'CompteDestination' });

// Relation entre Transaction et Virement
Transaction.hasOne(Virement, { foreignKey: 'idtransaction' });
Virement.belongsTo(Transaction, { foreignKey: 'idtransaction' });

module.exports = {
    sequelize,
    Client,
    Administrateur,
    Compte,
    Transaction,
    Virement
};
