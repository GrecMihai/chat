'use strict';

module.exports = function(_, passport, Validations){
   return{
     SetRouting: function(router){
       router.get('/', this.getLoginPage);
       router.get('/signup', this.getSignUpPage);

       router.get('/auth/facebook', this.facebookLogin);
       router.get('/auth/facebook/callback', this.facebookLoginCallback);
       router.get('/auth/google', this.googleLogin);
       router.get('/auth/google/callback', this.googleLoginCallback);

       router.post('/', Validations.LoginValidation,this.postLogin);
       router.post('/signup', Validations.SignUpValidation, this.postSignUp);
     },

     getLoginPage: function(req, res){
       const errors = req.flash('error');//same name like in User.js
       return res.render('index', {title: 'Chat | Login', messages: errors, hasErrors: errors.length > 0});//hasErrors - only if there are errors we will show them
     },
     postLogin: passport.authenticate('local.login', {
       successRedirect: '/home',
       failureRedirect: '/',
       failureFlash: true//to be able to use flash messages
     }),

     getSignUpPage: function(req, res){
       const errors = req.flash('error');//same name like in User.js
       return res.render('signup', {title: 'Chat | Signup', messages: errors, hasErrors: errors.length > 0});//hasErrors - only if there are errors we will show them
     },
     postSignUp: passport.authenticate('local.signup', {
       successRedirect: '/home',
       failureRedirect: '/signup',
       failureFlash: true//to be able to use flash messages
     }),
     facebookLogin: passport.authenticate('facebook', {
       scope: 'email'
     }),
     facebookLoginCallback: passport.authenticate('facebook',{
       successRedirect: '/home',
       failureRedirect: '/signup',
       failureFlash: true//momentan nu se afiseaza nimic ca nu ai trimis mesaje, dar poate te razgandesti
     }),
     googleLogin: passport.authenticate('google', {
       //daca foloseai ['profile', 'email'], nu ti'ar fi cerut permisiunea sa te loghezi, te'ar fi logat automat, iar URL urile sunt inlocuitoare pt cele 2
       scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read','https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email']
     }),
     googleLoginCallback: passport.authenticate('google',{
       successRedirect: '/home',
       failureRedirect: '/signup',
       failureFlash: true//momentan nu se afiseaza nimic ca nu ai trimis mesaje, dar poate te razgandesti
     })

   }
}
