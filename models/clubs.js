const mongoose = require('mongoose');

const clubNames = mongoose.Schema({
  name: {type:String, default:''},
  country: {type:String, default:''},
  sport: {type:String, default:''},
  image: {type:String, default: 'default.png'},
  fans: [{
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  }]
});

module.exports = mongoose.model('Club', clubNames);
