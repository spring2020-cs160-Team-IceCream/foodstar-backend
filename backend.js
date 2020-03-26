const express = require('express')
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 3000
const crypto = require('crypto');

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
  test = 1;
  const users = await Users.findAll({ where: { "user_id": test } });
  res.send(users)
})

app.post('/api/login', async (req, res) => {
  hashfunc = crypto.createHash('ripemd160')
  username = req.body.username
  password = req.body.password

  users = await Authentication.findAll({ where: { "username": username } });
  if (users.length > 0) {
    user = users[0]
    token = user.password

    hashfunc.update(user.startsalt.concat(password, user.endsalt))
    hash = hashfunc.digest();

    console.log(hash)
    
    if (hash === token) {
      res.send("nice!")
    }
  } else {
    res.send("f");
  }
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
