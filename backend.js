const express = require('express')
const app = express()
const port = 3000

const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

const Authentication = require('./models/authentication')(sequelize, Sequelize)


app.get('/api', async (req, res) => {
  const users = await Authentication.findAll();
  res.send(users)
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
