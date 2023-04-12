
'use strict'

const express = require('express')
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

require('dotenv').config()
app.set('view engine', 'ejs')
app.use(express.static('public'))
const passport = require('passport')
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







app.post('/register', (req, res) => {
  const {username, email, password} = req.body
})

app.post('/login', (req, res) => {
  const {username, email, password} = req.body
})









const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server running on port ' + port))
