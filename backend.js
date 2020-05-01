const express = require('express')
const crypto = require('crypto');
const config = require('config');
var cors = require('cors');

var multer = require('multer')
var upload = multer({dest: config.get('FileStorage').location})

const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(cors()) // allow cross-origin requests for local frontend development
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
 *   a. Authenticates user if hash values match with JSON boolean.
 *
 * Returns a Boolean value indicating valid / invalid login authentication
 */
app.post('/api/login', async (req, res) => {
  hashfunc = crypto.createHash('ripemd160')
  username = req.body.username
  password = req.body.password

  console.log(req.body)

  status = {status: false}

  users = await Authentication.findAll({ where: { "username": username } });
  if (users.length > 0 && username && password) {
    user = users[0]
    token = user.password

    hashfunc.update(user.startsalt.concat(password, user.endsalt))
    hash = hashfunc.digest('base64');

    console.log(hash)
    
    if (hash === token) {
      status.status = true
    }
  }
  res.send(status);
})

/*
 * POST Account Creation:
 * 1. Take in user data, send to backend
 *  a. Info provided: username, password, email, type, profile_pic, description
 *  b. Check if username unique, send error if duplicate
 * 2. Create Users Table Entry
 *  a. Create salted / hash of password, input to new authentication entry
 *  b. Connect user_id_fk value with user_id found in settings table
 *  c. Default values: startsalt = food, endsalt = star
 * 3. Create Settings Table Entry
 *  a. Foreign key user_id_fk matches those found in users, authentication tables
 *  b. Default values: Theme = "Light", View = "List"
 *
 * Returns JSON object with String status and Boolean return value for account creation
 */
app.post('/api/create_account', async (req, res) => {
  username = req.body.username
  password = req.body.password
  email = req.body.email
  startsalt = "food"
  endsalt = "star"
  result = {msg : "Error Creating Account.", status : false}
  if (username && password && email) { 
    users = await Authentication.findAll({ where: { "username": username } });
    if (users[0] != null || username.length > 20 || password.length > 40 || email.length > 30) {
      console.log("Issue creating account with username and password.")
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
      result.status = true
      result.msg = "Account Successfully Created!"
    }
  }
  res.send(result)
})

/*
 *  DELETE Account Deletion (assumes user already signed in):
 *  1. Authenticate user before deleting account
 *    a. Fields Sent: username, password
 *    b. Must meet following conditions to proceed:
 *      1. Hashed / Salted Password that of the database
 *  2. Delete posts created by user in posts table using user_id
 *    a. Fields Sent: user_id, username, password
 *  3. Using user_id, delete from users, authentication, and settings tables
 *    b. Deletion order: Settings -> Authentication -> users
 * 
 * Returns JSON object with boolean value for account deletion
 */
app.delete('/api/delete_account', async (req, res) => {
  hashfunc = crypto.createHash('ripemd160')
  username = req.body.username
  password = req.body.password
  status = {status : false}

  // Authenticate User Before deleting account
  if (username && password) {
    users = await Authentication.findAll({ where: { "username": username } });
    if (users.length != 0) {
      user = users[0]
      token = user.password
      id = user.user_id_fk

      hashfunc.update(user.startsalt.concat(password, user.endsalt))
      hash = hashfunc.digest('base64');
      if (hash == token) {  
        deletePosts = await Post.destroy({where: { user_id_fk: id} });
        deleteSettings = await Settings.destroy({where: { user_id_fk: id} });
        deleteAuth = await Authentication.destroy({where: { user_id_fk: id} });
        deleteUser = await Users.destroy({where: { user_id: id} });
        console.log(deletePosts + " Posts Deleted,\n" + deleteSettings
                    + " Settings Deleted,\n" + deleteUser + " Users deleted.")
        // Since User cannot be deleted without authentication and settings removed,
        // only need to check on the deleted user.
        if (deleteUser == 1) {
          status.status = true
        }
      }
    }
  }
  res.send(status)
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
app.post('/api/post', upload.any(), async (req, res) => {
  body = JSON.parse(req.body.data)
  result = {msg : "Account created successfully", status : true}
  
  post = {}
  
  post.rest_id_fk = body.rest_id_fk
  post.user_id_fk = body.user_id_fk
  /*
  if (!["Owner", "Casual"].includes(post.type = body.type)) {
    result.status = false
    result.msg = "Error: Post type is invalid."
  }
  */
  post.dish_name = body.dish_name
  post.category = body.category
  if (isNaN(post.price = parseFloat(body.price))) {
    result.status = false
    result.msg = "Error: Price not a valid float value."
  }
  post.description = body.description

  if (req.files.length == 0) {
    post.post_pic = "/files/noimage.jpg"
  } else {
    post.post_pic = "/files/" + req.files[0].filename
  }

  //restaurant_ID = 0
  //user_ID = body.user_id_fk
  //location = body.location
  // Concluding insert statement
  
  if (result.status) createPost = await Post.create(post)
  res.send(result)
})

app.listen(port, () => console.log("Example app listening on port ${port}!"))
