'use strict';

module.exports = function(){
  return{
    SignUpValidation: (req, res, next) => {
      //metodele notEmpty, isLength sunt din express validator
      req.checkBody('username', 'Username is Required').notEmpty();//this function takes the name of the input field from frontend(<input.... name = ""), and second parameter is the message send to frontend
      req.checkBody('username', 'Username must not be less than 5').isLength({min: 5});
      req.checkBody('email', 'Email is Required').notEmpty();
      req.checkBody('email', 'Email is invalid').isEmail();
      req.checkBody('password', 'Password is Required').notEmpty();
      req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
      req.getValidationResult()//this returns a Promise
        .then((result) => {
          const errors = result.array();
          const messages = [];
          //we only need the error messages
          errors.forEach((error) =>{
            messages.push(error.msg);
          });

          req.flash('error', messages);
          res.redirect('/signup');
        })
        .catch((err) => {
          return next();
        });
    },

    LoginValidation: (req, res, next) => {
      //metodele notEmpty, isLength sunt din express validator
      req.checkBody('email', 'Email is Required').notEmpty();
      req.checkBody('email', 'Email is invalid').isEmail();
      req.checkBody('password', 'Password is Required').notEmpty();
      req.checkBody('password', 'Password must not be less than 5').isLength({min: 5});
      req.getValidationResult()//this returns a Promise
        .then((result) => {
          const errors = result.array();
          const messages = [];
          //we only need the error messages
          errors.forEach((error) =>{
            messages.push(error.msg);
          });

          req.flash('error', messages);
          res.redirect('/');
        })
        .catch((err) => {
          return next();
        });
    }
  }
}
