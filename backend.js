const express = require('express')
const app = express()
const port = 3000

const {Sequelize, DataTypes} = require('sequelize');
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.define('Authentication', {
  // Model attributes are defined here
  username: {type: DataTypes.STRING},
  password: {type: DataTypes.STRING},
  startsalt: {type: DataTypes.STRING},
  endsalt: {type: DataTypes.STRING},
  user_id_fk: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  // Other model options go here
  tableName: 'authentication',
  timestamps: false
});


app.get('/api', async (req, res) => {
  const users = await sequelize.models.Authentication.findAll();
  res.send(users)
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
