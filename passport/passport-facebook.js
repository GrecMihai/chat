'use strict';

const passport = require('passport');
const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const secret = require('../secret/secretFile');

//functie ce ia ID'ul unui user si il salveaza in sesiune
passport.serializeUser((user, done) => {
  done(null, user.id);
});//ia ID'ul dintr'o sesiune si daca e valid returneaza din DB datele coresp
passport.deserializeUser((id, done) => {
  User.findById(id)
  .populate('request.userId')
  .populate('friendsList.friendId')
  .populate('sentRequest.user')
  .exec((err, user) => {
    done(err, user);
})
})

//add passport middleware that will deal with sign up
passport.use(new FacebookStrategy({
  clientID: secret.facebook.clientID,
  clientSecret: secret.facebook.clientSecret,
  profileFields: ['email','displayName','photos'],
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  passReqToCallback: true
  //token will contain a facebook token that will be generated, and profile will contain all the infos
}, (req, token, refreshToken, profile, done) => {

  User.findOne({facebook:profile.id}, (err, user) => {
    //network error, connection error or something like that
    if(err){
      return done(err);
    }
    //if the facebook account already signed up
    if(user){
      return done(null, user);
    }

    //save the data in the DB
    const newUser = new User();
    newUser.facebook = profile.id;
    newUser.username = profile.displayName;//FACE ASTA CA SA NU FIE EMPTY
    newUser.email = profile._json.email;
    newUser.userImage = 'default.png';
    newUser.fbTokens.push({token:token});
    newUser.save((err) => {
      done(null, newUser);
    });
  });

}));
