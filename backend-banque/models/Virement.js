module.exports = (sequelize, DataTypes) => {
    const Virement = sequelize.define('Virement', {
        idvirement: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        comptesource: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'compte',
                key: 'idcompte'
            }
        },
        comptedestination: {
            type: DataTypes.STRING(50),
            allowNull: false,
            references: {
                model: 'compte',
                key: 'idcompte'
            }
        },
        montant: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        datevirement: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        idtransaction: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'transaction',
                key: 'idtransaction'
            }
        }
    }, {
        tableName: 'virement',
        timestamps: false
    });

    return Virement;
};
