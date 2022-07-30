require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const mongoose = require('mongoose')
// const encrypt = require('mongoose-encryption')
const bcrypt = require('bcrypt')
const saltRounds = 10

const app = express()

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

console.log(process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
})

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
})

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ['password'],
// })

const User = new mongoose.model('User', userSchema)

app.get('/', function (req, res) {
  res.render('home')
})

app
  .route('/login')
  .get(function (req, res) {
    res.render('login')
  })
  .post(function (req, res) {
    const username = req.body.username
    const password = req.body.password
    User.findOne({ email: username }, function (err, foundDetails) {
      if (err) console.log(err)
      else
        bcrypt.compare(password, foundDetails.password, function (err, result) {
          if (result === true) {
            res.render('secrets')
          } else console.log('wrong password')
        })
    })
  })

app
  .route('/register')
  .get(function (req, res) {
    res.render('register')
  })
  .post(function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      const createUser = new User({
        email: req.body.username,
        password: hash,
      })
      createUser.save(function (err) {
        if (err) {
          console.log(err)
        } else {
          res.render('secrets')
        }
      })
    })
  })

app.listen(3000, function (req, res) {
  console.log('Server started on port 3000')
})
