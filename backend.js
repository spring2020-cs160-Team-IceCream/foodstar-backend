const express = require('express')
const crypto = require('crypto');
const config = require('config');

const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
const port = 3000

const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('foodstar', 'dbaccess', '12345', {
  host: config.get('Database').host,
  dialect: 'mysql'
});

//console.log(config.get('Database').host)

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
   GET Homepage Content: Grab group of 10 posts for homepage
   Question: No variable to get current location of user, needed for 
   location-based homepage matchup.

app.post('/api/login', async (req, res) => {
  implementation here
})
*/


/*
 * GET Search:
 * 1. Use req.body to filter out search results
 *    a. Fields sent: category, price, location, avg_self_rating
 * 2. Filter through each attribute and return the results from search
 *    a. Order: Category -> Location -> Rating -> Price
 * 
 * ToDo:
 * - Figure Out Default Attribute Search Logic
 * - Figure out location settings
 * - Test on new posts
 * 
 * Returns Array of JSON post objects
 */
app.post('/api/search', async (req, res) => {
  body = req.body
  results = await Post.findAll({ where: { "category": body.category } });
  console.log("By Category: " + results)

  // By Location
  if (body.location != null) {
    for (i = 0; i < results.length; i++) {
      if (results[i].location != body.location) {
        results[i] = null
      }
      //console.log(results[i].location + "\n")
    }
    results = results.filter(e => e != null);
    console.log("By Location: " + results)
  }
  
  // By Rating
  if (body.location != null) {
    for (i = 0; i < results.length; i++) {
      if (results[i].avg_self_rating <  body.avg_self_rating) {
        results[i] = null
      }
      //console.log(results[i].avg_self_rating + "\n")
    }
    results = results.filter(e => e != null);
    console.log("By Rating: " + results)
  } 

  // By Price
  if (body.price != null) {
    for (i = 0; i < results.length; i++) {
      if (results[i].price > body.price) {
        results[i] = null
      }
      //console.log(results[i].price + "\n")
    }
    results = results.filter(e => e != null);
    console.log("By Price: " + results)
  } 
  
  res.send(results)
})

/*
 * POST Login Authentication: 
 * 1. Using ripedmd160 hash function, adds start and 
 *    end salt to plaintext and sends hash to backend. 
 * 2. Compare hash to stored hash value in associated with specified
 *    username in database.
 *   a. Authenticates user if hash values match.
 *   b. Sends error status message if mismatched values.
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

/*
 * POST Account Creation:
 * 1. Take in user data, send to backend
 *  a. Info provided: username, password, type, profile_pic, description
 *  b. Check if username unique, send error if duplicate
 * 2. Create Users Table Entry
 *  a. Create salted / hash of password, input to new authentication entry
 *  b. Connect user_id_fk value with user_id found in settings table
 *  c. Default values: startsalt = food, endsalt = star
 * 3. Create Settings Table Entry
 *  a. Foreign key user_id_fk matches those found in users, authentication tables
 *  b. Default values: Theme = "Light", View = "List"
 * 
 * Returns JSON object with boolean value for account creation
 */
app.post('/api/create_account', async (req, res) => {
  username = req.body.username
  password = req.body.password
  startsalt = "food"
  endsalt = "star"
  status = {status : false}

  users = await Authentication.findAll({ where: { "username": username } });
  if (users[0] != null) {
    console.log("Username " + username + " already in use.")
    res.send(status)
  }
  else {
    createUser = await Users.create(req.body)
    user_id_fk = createUser.user_id
    //console.log("username: " + username + "\nPassword: " + password)

    // Hash / salt password and create Authentication entry
    hashfunc = crypto.createHash('ripemd160')
    hashfunc.update(startsalt.concat(password, endsalt))
    password = hashfunc.digest('base64');
    //console.log("Hash = " + password)
    createAuth = await Authentication.create({username, password, startsalt, endsalt, user_id_fk})

    //Create Settings Entry
    theme = "Light"
    view = "List"
    createSettings = await Settings.create({theme, view, user_id_fk})
    status.status = true
    res.send(status)
  }
})


/*
 * POST Foodstar Post Creation:
 *  1. Use req.body and create function on Post model
 *     a. Fields sent: Dish name, restaurant, price, description, picture
 *     b. How to assign location, post ID, restaurant ID, and user ID?
 *        Possibly get all values and create JSON object to insert?
 *   2. Create name field for restaurant, set to 0 or 1 for default
 *     a. Reformat API to specify variable names
 */
app.post('/api/post', async (req, res) => {
  body = req.body
  //restaurant_ID = 0
  //user_ID = body.user_id_fk
  //location = body.location
  // Concluding insert statement
  createPost = await Post.create(req.body)
  res.sendStatus(200)
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))