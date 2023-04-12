
'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

require('dotenv').config()
app.set('view engine', 'ejs')
app.use(express.static('public'))
const _ = require('lodash')
const bcrypt = require('bcrypt')

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

const {User} = require('./db')






app.get('/', (req, res) => {
  res.render('home')
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.delete('/logout', (req, res) => {
  res.redirect('/')
})

app.get('/submit', (req, res) => {
  res.render('submit')
})

app.post('/submit', (req, res) => {
  const secret = req.body.secret
  res.send('<h2>'+ secret + '</h2>')
})








app.post('/register', (req, res) => {
  const email = _.toLower(req.body.email)
  const password = req.body.password
  
  if(email && password){
    const saltRounds = 15
    bcrypt.hash(password, saltRounds)
    .then(hash => {
      const user = new User({
        email: email,
        password: hash
      })
      user.save()
      .then(() => {
        console.log('New user created.')
        res.render('secrets')
      })
      .catch(err => console.log(err.message))
    })
  }
  else{
    console.log('Email or Password Empty!')
    res.send('<h2>Email or Password Empty!</h2>')
  }
})

app.post('/login', (req, res) => {
  const email = _.toLower(req.body.email)
  const password = req.body.password
  
  User.find({email: email})
  .then(user => {
    if(user != ''){
      bcrypt.compare(password, user[0].password)
      .then(true_ => {
        if(true_){
          console.log('Successfully logged in.')
          res.render('secrets')
        }
        else {
          console.log('Password Error.')
          res.send('<h2>Email or Password Error!</h2>')
        }
      })
    }
    else{
      console.log('Email not found.')
      res.send('<h2>Email or Password Error!</h2>')
    }
  })
  .catch(err => {
    console.log(err.message)
    res.send('<h2>Email or Password Error!</h2>')
  })
})









const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server running on port ' + port))
