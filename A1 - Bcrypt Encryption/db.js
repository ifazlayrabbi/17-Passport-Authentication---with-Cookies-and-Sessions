
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://'+process.env.user+':'+process.env.pass+'@cluster0.pbwxcxc.mongodb.net/passportDB')
// mongoose.connect('mongodb://127.0.0.1:27017/passportDB')
// const encrypt = require('mongoose-encryption')





const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username missing !'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email missing !'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password missing !']
  },
  encryptionType: String
})

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']})

const User = mongoose.model('User', userSchema)
exports.User = User








const user1 = new User({
  username: 'rahim1',
  email: 'Rahim1@gmail.com',
  password: '1111'
})
// user1.save()
// .then(() => console.log('New user registered.'))
// .catch(err => console.log(err.message))
