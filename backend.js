const express = require('express')
const app = express()
const port = 3000

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

app.get('/api', (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('DB connected!')
  } catch (error) {
    res.send('DB connection failed!')
  }
  //res.send('Hello World!')
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
