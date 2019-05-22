const mongoose = require('mongoose');//altfel nu merge cu passport
const bcrypt = require('bcrypt-nodejs');
//asa va arata in baza de date Userul
const userSchema = mongoose.Schema({
  username: {type: String},
  fullname: {type: String},
  email: {type: String},
  password: {type: String, default: ''},
  userImage: {type:String, default: 'default.png'},
  facebook: {type: String, default: ''},
  fbTokens: Array,
  google: {type: String, default: ''},
  sentRequest: [{
    username: {type: String, default: ''}
  }],
  request: [{
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: {type: String, default: ''}
  }],
  friendsList: [{
    friendId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    friendName: {type: String, default: ''}
  }],
  totalRequest: {type: Number, default: 0},
  gender: {type: String, default:''},
  country: {type: String, default: ''},
  mantra: {type:String, default: ''},
  favPlayers: [{
    playerName: {type: String}
  }]
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
