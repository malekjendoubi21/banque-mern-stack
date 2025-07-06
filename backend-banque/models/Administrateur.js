module.exports = (sequelize, DataTypes) => {
    const Administrateur = sequelize.define('Administrateur', {
        idadmin: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },        motdepasse: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'administrateur',
        timestamps: false
    });

    return Administrateur;
};
