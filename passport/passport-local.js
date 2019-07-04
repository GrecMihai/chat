'use strict';

const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

//functie ce ia ID'ul unui user si il salveaza in sesiune
passport.serializeUser((user, done) => {
  done(null, user.id);
});//ia ID'ul dintr'o sesiune si daca e valid returneaza din DB datele coresp
passport.deserializeUser((id, done) => {
  //User.findById(id, (err, user) => {
    User.findById(id)
    .populate('request.userId')
    .populate('friendsList.friendId')
    .populate('sentRequest.user')
    .exec((err, user) => {
      done(err, user);
  })
})

//add passport middleware that will deal with sign up
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true//all of the user data will be passed to the Callback
}, (req, email, password, done) => {

  User.findOne({'email': email}, (err, user) => {
    //network error, connection error or something like that
    if(err){
      return done(err);
    }
    //if the email already exist
    if(user){
      return done(null, false, req.flash('error', 'User with this email already exists'));
    }
    const nameRegex = new RegExp("^"+req.body.username.toLowerCase(), "i");
    User.findOne({'username': nameRegex}, (err, user1) =>{
      if(err){
        return done(err);
      }
      //if the username already exist
      if(user1){
        return done(null, false, req.flash('error', 'User with this username already exists'));
      }
      //save the data in the DB
      const newUser = new User();
      newUser.username = req.body.username.split('.').join("");
      newUser.email = req.body.email;
      newUser.password = newUser.encryptPassword(req.body.password);
      newUser.userImage = "default.png";

      newUser.save((err) => {
        done(null, newUser);
      });
    });
  });

}));


passport.use('local.login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true//all of the user data will be passed to the Callback
}, (req, email, password, done) => {

  User.findOne({'email': email}, (err, user) => {
    if(err){
      return done(err);
    }
    const messages = [];
    //if email does not exist or if the password is incorrect
    if(!user || !user.validUserPassword(password)){
      messages.push('Email does not exists or password is invalid');
      return done(null, false, req.flash('error', messages));
    }
    //console.log(user);

    return done(null, user);
  });

}));
