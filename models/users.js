module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Users', {
        // Model attributes are defined here
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        type: {type: DataTypes.STRING},
        profile_pic: {type: DataTypes.STRING},
        description: {type: DataTypes.STRING}
    }, {
        // Other model options go here
        tableName: 'users',
        timestamps: false
    });
}