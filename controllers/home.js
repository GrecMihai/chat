
 module.exports = function(_, async, Club, Users){
   return {
     SetRouting: function(router){
       router.get('/home', this.homePage);
       router.post('/home', this.postHomePage);

       router.get('/logout', this.logout);
     },

     homePage: function(req, res){
       //this allows each function to run in parallel
       async.parallel([
         function(callback){
           //find all the data
           Club.find({}, (err, result) => {
             callback(err, result);
           });
         },
         //to aggregate DB based on country
         function(callback){
           Club.aggregate([{
             $group: {
               _id: "$country"
             }
           }], (err, newResult) => {
             callback(err, newResult);
           });
         },
         function(callback){
           Users.findOne({'username':req.user.username})//search for the user
             .populate('request.userId')//for that particular user, if the user already has a friend request, is going to populate that field userId, with all the data of the user that send the friend request
             .exec((err, result) => {
               callback(err, result);
             });
         }
       ], (err, results) => {
         //get the result of first function
         const res1 = results[0];
         const res2 = results[1];
         const res3 = results[2];
         //ca sa afiseze cate 3 pe o linie, nu una sub alta la home page
         const dataChunk = [];
         const chunkSize = 3;
         for(let i = 0; i < res1.length; i+=chunkSize){
           dataChunk.push(res1.slice(i, i + chunkSize));
         }
         const countrySort = _.sortBy(res2, '_id');//sorting the countries

         res.render('home', {title: 'Chat - Home', user:req.user, chunks: dataChunk, country: countrySort, data: res3});
       })
     },
     postHomePage: function(req, res){
       async.parallel([
         function(callback){
           //add the fan to the fans field in clubNames collection
           Club.update({
             '_id':req.body.id,
             'fans.username':{$ne: req.user.username}//verify that he is not already a fan
           },{
             $push: {fans: {
               username: req.user.username,
               email: req.user.email
             }}
           }, (err, count) => {
             console.log(count);
             callback(err, count);
           });
         }
       ], (err, results) => {
         res.redirect('/home');
       });
     },
     logout: function(req, res){
       req.logout();//log the user out(metoda poate fi utilizata pt ca avem passport)
       req.session.destroy((err) => {
         res.redirect('/');
       });
     }
   }
 }
