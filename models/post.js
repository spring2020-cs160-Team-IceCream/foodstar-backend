module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Post', {
        // Model attributes are defined here
        post_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        type: {type: DataTypes.STRING},
        location: {type: DataTypes.STRING},
        timestamp: {type: 'TIMESTAMP'},
        category: {type: DataTypes.STRING},
        post_pic: {type: DataTypes.STRING},
        description: {type: DataTypes.STRING},
        price: {type: DataTypes.DECIMAL},
        rest_rating: {type: DataTypes.DECIMAL},
        avg_self_rating: {type: DataTypes.DECIMAL},
        rest_id_fk: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        user_id_fk: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        // Other model options go here
        tableName: 'post',
        timestamps: false
    });
}