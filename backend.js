const express = require('express')
const app = express()
const port = 3000

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

(async() => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


app.get('/api', (req, res) => {
  res.send('Backend Connection Successful: Hello World 4!')
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
