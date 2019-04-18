'use strict'; //javascript strict mode(????)

module.exports = function(_, passport, User){
   return{
     SetRouting: function(router){
       router.get('/', this.indexPage);
       router.get('/signup', this.getSignUp);
       router.get('/home', this.homePage);
       router.get('/auth/facebook', this.getFacebookLogin);
       router.get('/auth/facebook/callback', this.facebookLogin);

       router.post('/', User.LoginValidation,this.postLogin);
       router.post('/signup', User.SignUpValidation, this.postSignUp);
     },

     indexPage: function(req, res){
       const errors = req.flash('error');//same name like in User.js
       return res.render('index', {title: 'Chat | Login', messages: errors, hasErrors: errors.length > 0});//hasErrors - only if there are errors we will show them
     },
     postLogin: passport.authenticate('local.login', {
       successRedirect: '/home',
       failureRedirect: '/',
       failureFlash: true//to be able to use flash messages
     }),

     getSignUp: function(req, res){
       const errors = req.flash('error');//same name like in User.js
       return res.render('signup', {title: 'Chat | Signup', messages: errors, hasErrors: errors.length > 0});//hasErrors - only if there are errors we will show them
     },
     postSignUp: passport.authenticate('local.signup', {
       successRedirect: '/home',
       failureRedirect: '/signup',
       failureFlash: true//to be able to use flash messages
     }),
     getFacebookLogin: passport.authenticate('facebook', {
       scope: 'email'
     }),
     facebookLogin: passport.authenticate('facebook',{
       successRedirect: '/home',
       failureRedirect: '/signup',
       failureFlash: true//momentan nu se afiseaza nimic ca nu ai trimis mesaje, dar poate te razgandesti
     }),
     homePage: function(req, res){
       return res.render('home');
     },
     test: function(){
       console.log('se apasa');
     }
   }
}
