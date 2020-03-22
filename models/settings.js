module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Settings', {
        // Model attributes are defined here
        theme: {type: DataTypes.STRING},
        view: {type: DataTypes.STRING},
        user_id_fk: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        // Other model options go here
        tableName: 'settings',
        timestamps: false
    });
}