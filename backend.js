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

// Test GET with simple retrieval of user_id 1
app.get('/api', async (req, res) => {
  test = 1;
  const users = await Users.findAll({ where: { "user_id": test } });
  res.send(users)
})

/*
  POST Login Authentication: 
  1. Using ripedmd160 hash function, adds start and 
     end salt to plaintext and sends hash to backend. 
  2. Compare hash to stored hash value in associated with specified
     username in database.
    a. Authenticates user if hash values match.
    b. Sends error status message if mismatched values.
*/
app.post('/api/login', async (req, res) => {
  hashfunc = crypto.createHash('ripemd160')
  username = req.body.username
  password = req.body.password

  status = {status: "f"}

  users = await Authentication.findAll({ where: { "username": username } });
  if (users.length > 0) {
    user = users[0]
    token = user.password

    hashfunc.update(user.startsalt.concat(password, user.endsalt))
    hash = hashfunc.digest('base64');

    console.log(hash)
    
    if (hash === token) {
      status.status = "nice!"
    }
  }
  res.send(status);
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
