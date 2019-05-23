
 module.exports = function(_, async, Club, Users, Message, FriendResult){
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
         //to aggregate DB based on sport
         function(callback){
           Club.aggregate({
             $group: {
               _id: "$sport"
             }
           }, (err, newResult) => {
             callback(err, newResult);
           });
         },
         function(callback){
           Users.findOne({'username':req.user.username})//search for the user
             .populate('request.userId')//for that particular user, if the user already has a friend request, is going to populate that field userId, with all the data of the user that send the friend request
             .exec((err, result) => {
               callback(err, result);
             });
         },
         function(callback){
           const nameRegex = new RegExp("^"+req.user.username.toLowerCase(), "i");
           Message.aggregate(
             {$match:{$or:[{'senderName':nameRegex},
             {'receiverName':nameRegex}]}},//ia toate mesajele in care apare senderul
             {$sort:{'createdAt':-1}},//le sorteaza in ordine descrescatoare dupa data
             {
               $group:{"_id":{
                 //this is a message that we create
                 "last_message_between":{
                   $cond:[
                     {
                       $gt:[//get the sender and receiver name
                         {$substr:["$senderName", 0, 1]},
                         {$substr:["$receiverName", 0, 1]}]
                     },
                       {$concat:["$senderName"," and ","$receiverName"]},
                       {$concat:["$receiverName"," and ","$senderName"]}
                   ]
                 }
               }, "body":{$first:"$$ROOT"}
               }
             }, function(err, newResult){
               //callback(err, newResult);
               const arr = [
                 {path:'body.sender', model: 'User'},
                 {path:'body.receiver', model: 'User'}
               ];

               Message.populate(newResult, arr, (err, newResult1) => {
                 console.log(newResult1[0].body.sender);
                 callback(err, newResult1);
               });
             }
           )
         }
       ], (err, results) => {
         //get the result of all functions
         const res1 = results[0];
         const res2 = results[1];
         const res3 = results[2];
         const res4 = results[3];
         //ca sa afiseze cate 3 pe o linie, nu una sub alta la home page
         const dataChunk = [];
         const chunkSize = 3;
         for(let i = 0; i < res1.length; i+=chunkSize){
           dataChunk.push(res1.slice(i, i + chunkSize));
         }
         const countrySort = _.sortBy(res2, '_id');//sorting the countries

         res.render('home', {title: 'Chat - Home', user:req.user, chunks: dataChunk, country: countrySort, data: res3, chat: res4});
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
             //console.log(count);
             callback(err, count);
           });
         }

       ], (err, results) => {
         res.redirect('/home');
       });

       FriendResult.PostRequest(req, res, '/home');
     },
     logout: function(req, res){
       req.logout();//log the user out(metoda poate fi utilizata pt ca avem passport)
       req.session.destroy((err) => {
         res.redirect('/');
       });
     }
   }
 }
