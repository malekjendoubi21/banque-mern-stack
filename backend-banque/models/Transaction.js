module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        idtransaction: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        montant: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },
        datetransaction: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        idcompte: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
                model: 'compte',
                key: 'idcompte'
            }
        },        idadmin: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'administrateur',
                key: 'idadmin'
            }
        }
    }, {
        tableName: 'transaction',
        timestamps: false
    });

    return Transaction;
};
