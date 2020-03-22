const express = require('express')
const app = express()
const port = 3000

const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

const Authentication = require('./models/authentication')(sequelize, DataTypes)
const Post = require('./models/post')(sequelize, DataTypes)
const Restaurant = require('./models/restaurant')(sequelize, DataTypes)
const Settings = require('./models/settings')(sequelize, DataTypes)
const Users = require('./models/users')(sequelize, DataTypes)


app.get('/api', async (req, res) => {
  test = 0;
  const users = await Users.findAll({where: {"user_id": test}});
  res.send(users)
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
