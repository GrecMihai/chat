'use strict';

const passport = require('passport');
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const secret = require('../secret/secretFile');

//functie ce ia ID'ul unui user si il salveaza in sesiune
passport.serializeUser((user, done) => {
  done(null, user.id);
});//ia ID'ul dintr'o sesiune si daca e valid returneaza din DB datele coresp
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {////!!!!!!!!!!!!!!!!!!!!!!!!vezi cum poti face cu funciton nu cu vrajeala asta de ()=>
    done(err, user);
  })
})

//add passport middleware that will deal with sign up
passport.use(new GoogleStrategy({
  clientID: secret.google.clientID,
  clientSecret: secret.google.clientSecret,
  callbackURL: 'http://localhost:3000/auth/google/callback',
  passReqToCallback: true
  //token will contain a facebook token that will be generated, and profile will contain all the infos
}, (req, accessToken, refreshToken, profile, done) => {

  User.findOne({google:profile.id}, (err, user) => {
    //network error, connection error or something like that
    if(err){
      return done(err);
    }
    if(user){
      return done(null, user);
    }
    const newUser = new User();
    newUser.google = profile.id;
    newUser.fullname = profile.displayName;
    newUser.userImage = profile._json.picture;
    newUser.username = 'test123';

    newUser.save((err) => {
      if(err){
        return done(err);
      }
      return done(null, newUser);
    });

  });

}));
