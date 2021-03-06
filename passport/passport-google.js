'use strict';

const passport = require('passport');
const User = require('../models/user');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

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
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://sportbabble.herokuapp.com/auth/google/callback',
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
    newUser.username = profile.displayName;//FACE ASTA DOAR CA SA NU IL LASE GOL
    newUser.userImage = profile._json.picture;
    newUser.userImage = "default.png";
    newUser.email = profile.emails[0].value;

    User.findOne({'username': profile.displayName}, (err, user1) =>{
      if(err){
        return done(err);
      }
      //if the username already exist
      if(user1){
        newUser.username = 'babbler';
      }
      newUser.save((err) => {
        done(null, newUser);
      });
    });

  });

}));
