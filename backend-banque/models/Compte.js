module.exports = (sequelize, DataTypes) => {
    const Compte = sequelize.define('Compte', {
        idcompte: {
            type: DataTypes.STRING(50),
            primaryKey: true
        },
        typecompte: {
            type: DataTypes.STRING,
            allowNull: false
        },
        solde: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        datecreation: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        etat: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'
        },
        idclient: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'client',
                key: 'idclient'
            }
        },
        idadmin: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'administrateur',
                key: 'idadmin'
            }
        }
    }, {
        tableName: 'compte',
        timestamps: false
    });

    return Compte;
};
