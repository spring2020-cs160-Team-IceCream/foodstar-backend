module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Restaurant', {
        // Model attributes are defined here
        rest_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        location: {type: DataTypes.STRING},
        avg_price: {type: DataTypes.DECIMAL},
        pop_dishes: {type: DataTypes.STRING},
        menu_pic: {type: DataTypes.STRING},
        avg_rating: {type: DataTypes.DECIMAL},
    }, {
        // Other model options go here
        tableName: 'restaurant',
        timestamps: false
    });
}