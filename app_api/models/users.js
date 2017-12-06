let mongoose = require('mongoose');
let autoIncrement = require('mongoose-auto-increment');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let conn = mongoose.connection;
autoIncrement.initialize(conn);

let userSchema = new mongoose.Schema ({
  email: {type: String, unique: true, required: true},
  username: {type: String, unique: true, required: true},
  name: {type: String, required: true},
  admin: {type: Boolean, default: false},
  mailNotifications: {type: Boolean, default: false},
  delegating: {type: Boolean, default: false},
  delegateTo: {type: Number, ref: 'User', required: false},
  delegateUntil: {type: Date, required: false},
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha1').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64,'sha1').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  let expiry =  new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    name: this.name,    
    admin: this.admin,
    mailNotifications: this.mailNotifications,
    delegating: this.delegating,
    delegateTo: this.delegateTo,
    delegateUntil: this.delegateUntil,
    exp: parseInt(expiry.getTime()/1000)
  }, process.env.JWT_SECRET);
};

userSchema.plugin(autoIncrement.plugin,'User');
mongoose.model('User', userSchema);
