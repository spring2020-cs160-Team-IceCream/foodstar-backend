module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Authentication', {
        // Model attributes are defined here
        username: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        startsalt: { type: DataTypes.STRING },
        endsalt: { type: DataTypes.STRING },
        user_id_fk: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        // Other model options go here
        tableName: 'authentication',
        timestamps: false
    });
}

