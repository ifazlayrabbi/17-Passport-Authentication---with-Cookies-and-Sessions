
'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

require('dotenv').config()
app.set('view engine', 'ejs')
app.use(express.static('public'))
const _ = require('lodash')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
const bcrypt = require('bcrypt')

const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
app.use(flash())

// const {User} = require('./db')
const {login_by_passport} = require('./passport_login_setup')









app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const users = []
login_by_passport(
  passport,
  email => users.find(user => user.email === email),
  _id => users.find(user => user._id === _id)
)








app.get('/', (req, res) => {
  res.render('home')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/login', (req, res) => {
  res.render('login')
})

// app.get('/secrets', (req, res) => {
//   if(req.isAuthenticated())
//     res.render('secrets')
//   else
//     res.redirect('/login')
// })


app.get('/secrets', checkAuthentication, (req, res) => {
  res.render('secrets')
})

function checkAuthentication (req, res, next) {
  if(req.isAuthenticated())
    return next()
  res.redirect('/login')
}










//////////////////////  Security: Level 1 - Match Password  //////////////////

function matchPasswordAuth () {
  app.post('/register', (req, res) => {
    const username = _.toLower(req.body.username)
    const email = _.toLower(req.body.email)
    const password = req.body.password
  
    User.find({email: email})
    .then(userData => {
      if(userData != ''){
        console.log('Email exists.')
        res.send('<h2>Email is already used. <a href="/login">Login</a></h2>')
      }
      else{
        User.find({username: username})
        .then(userData => {
          if(userData != ''){
            console.log('username exists.')
            res.send('<h2>Username is taken. <a href="/register">Register</a></h2>')
          }
          else{
            const user = new User({
              username: username,
              email: email,
              password: password
            })
            user.save()
            .then(() => {
              console.log('New user created.')
              res.render('secrets')
            })
          }
        })
        .catch(err => console.log(err.message))
      }
    })
    .catch(err => console.log(err.message))
  
  })
  
  app.post('/login', (req, res) => {
    const email_or_user = _.toLower(req.body.email_or_user)
    const password = req.body.password
  
    User.find({$or: [{username: email_or_user}, {email: email_or_user}]})
    .then(userData => {
      console.log(userData)
      if(userData[0].password === password){
        console.log('Loged in successfully.')
        res.render('secrets')
      }
      else{
        console.log('Login failed.')
        res.send('<h2>Username or Password error ! <a href="/login">Login</a></h2>')
      }
    })
    .catch(err => {
      res.send('<h2>Username or Password error !</h2>')
      console.log(err.message)
    })
  })
}
// matchPasswordAuth ()

//////////////////////////////////////////////////////////////////////////////











//////////////////////  Security: Level 4 - bcrypt Authentication  /////////////////////////////

function bcryptAuth () {
  app.post('/register', async (req, res) => {
    const username = _.toLower(req.body.username)
    const email = _.toLower(req.body.email)
    const password = await bcrypt.hash(req.body.password, 15)
  
    User.find({email: email})
    .then(userData => {
      if(userData != ''){
        console.log('Email exists.')
        res.send('<h2>Email is already used. <a href="/login">Login</a></h2>')
      }
      else{
        User.find({username: username})
        .then(userData => {
          if(userData != ''){
            console.log('username exists.')
            res.send('<h2>Username is taken. <a href="/register">Register</a></h2>')
          }
          else{
            const user = new User({
              username: username,
              email: email,
              password: password
            })
            user.save()
            .then(() => {
              console.log('New user created.')
              res.render('secrets')
            })
          }
        })
        .catch(err => console.log(err.message))
      }
    })
    .catch(err => console.log(err.message))
  
  })
  
  app.post('/login', (req, res) => {
    const username = _.toLower(req.body.username)
    const password = req.body.password
  
    User.find({$or: [{username: username}, {email: username}]})
    .then(userData => {
      if (userData != '') {
        bcrypt.compare(password, userData[0].password)
        .then(found => {
          console.log(found)
          if(found){
            console.log('login succeed.')
            res.render('secrets')
          }
          else{
            console.log('Wrong password.')
            res.send('<h2>Username or password error ! <a href="/login">Login</a> <a href="/register">Register</a></h2>')
          }
        })
        .catch(err => console.log(err.message))
      }
      else {
        res.send('<h2>User not found. <a href="/register">Register</a></h2>')
        console.log('User not found.')
      }
    })
    .catch(err => {
      res.send('<h2>Username or Password error !</h2>')
      console.log(err.message)
    })
  })
}
// bcryptAuth ()

////////////////////////////////////////////////////////////////////////////














//////////////////////  Passport Authentication - using Array /////////////////////

function passportAuth () {
  app.post('/register', (req, res) => {
    const username = _.toLower(req.body.username)
    const email = _.toLower(req.body.email)
    let password = req.body.password
  
    const userData = users.find(users_ => users_.email === email)
    if(!userData){
      const userData = users.find(users_ => users_.username === username)
      if(!userData){
        if((username && email && password) != ''){
  
          bcrypt.hash(password, 15)
          .then(hashedPassword => {
            users.push({
              _id: Date.now().toString(),
              username: username,
              email: email,
              password: hashedPassword
            })
            res.redirect('/login')
          })
          .catch(err => console.log(err.message))
        } else(res.send('<h2>Some field(s) empty !</h2>'))
      }
      else {res.send('<h2>Username is taken. <a href="/register">Register</a></h2>')}
    }
    else {res.send('<h2>Email already used. <a href="/register">Register</a></h2>')}
  })
  
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/secrets',
    failureRedirect: '/login',
    failureFlash: true
  }))
}
passportAuth()

//////////////////////////////////////////////////////////////////////









const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server running on port ' + port))
