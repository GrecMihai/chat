const mongoose = require('mongoose');//altfel nu merge cu passport
const bcrypt = require('bcrypt-nodejs');
//asa va arata in baza de date Userul
const userSchema = mongoose.Schema({
  username: {type: String, unique: true},
  fullname: {type: String, unique: true, default: ''},
  email: {type: String, unique: true},
  password: {type: String, default: ''},
  userImage: {type:String, default: 'default.png'},
  facebook: {type: String, default: ''},
  fbTokens: Array,
  google: {type: String, default: ''},
  googleTokens: Array
});

//encrypt the password before put it in the DB
userSchema.methods.encryptPassword = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

//decrypt the password
userSchema.methods.validUserPassword = function(password){
  return bcrypt.compareSync(password, this.password);//this.password is the password in the DB for which it is called
}

module.exports = mongoose.model('User', userSchema);
