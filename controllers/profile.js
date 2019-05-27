module.exports = function(async, Users, Message, aws, formidable, FriendResult){
  return {
    SetRouting: function(router){
      router.get('/settings/profile', this.getProfilePage);
      router.get('/profile/:name', this.overviewPage);

      router.post('/settings/profile', this.postProfilePage);
      router.get('/profile/:name', this.overviewPostPage);
      router.post('/userupload', aws.Upload.any(), this.userUpload);
    },
    getProfilePage: function(req, res){
      async.parallel([
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
            {$match:{$or:[{'sender':req.user._id},
            {'receiver':req.user._id}]}},//ia toate mesajele in care apare senderul
            {$sort:{'createdAt':-1}},//le sorteaza in ordine descrescatoare dupa data
            {
              $group:{"_id":{
                //this is a message that we create
                "last_message_between":{
                  $concat:["user1"," and ", " user2"]
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
                //console.log(newResult1);
                callback(err, newResult1);
              });
            }
          )
        },
      ], (err, results) => {
        const result1 = results[0];
        const result2 = results[1];
        res.render('user/profile', {title: 'SPORTbabble - Profile', user:req.user, data:result1, chat:result2});
      });
    },
    postProfilePage:function(req, res){

      FriendResult.PostRequest(req, res, '/settings/profile');
      async.waterfall([
        function(callback){
          var userExists = false;
          if(req.body.username !== req.user.username){
            const nameRegex = new RegExp("^"+req.body.username.toLowerCase(), "i");
            Users.findOne({'username': nameRegex}, (err, user1) =>{
              if(err){
                return done(err);
              }
              //if the username already exist
              if(user1){
                userExists = true;
              }
              callback(null, userExists);
            });
            }
            else{
              callback(null, userExists);
            }

        },
        //get the user data
        function(userExists, callback){
          Users.findOne({'_id':req.user._id}, (err, result) => {
            const result1 = {
              result: result,
              userExists: userExists
            }
            callback(err, result1);
          })
        },
        //update the data
        function(result1, callback){
          if(!result1.userExists){
            //if the user has not changed the image, we will take the image it already is in the database
            if(req.body.upload === null || req.body.upload === ''){
              Users.update({
                '_id':req.user._id
              },
              {
                username: req.body.username,
                fullname: req.body.fullname,
                mantra: req.body.mantra,
                gender: req.body.gender,
                country: req.body.country,
                userImage: result1.result.userImage
              },
              {
                upsert: true//if the field does not already exist in the document, is going to add it to the particular value
              }, (err, result) => {
                res.redirect('/settings/profile');
              })
            } else if(req.body.upload !== null || req.body.upload !== ''){
              Users.update({
                '_id':req.user._id
              },
              {
                username: req.body.username,
                fullname: req.body.fullname,
                mantra: req.body.mantra,
                gender: req.body.gender,
                country: req.body.country,
                userImage: req.body.upload
              },
              {
                upsert: true//if the field does not already exist in the document, is going to add it to the particular value
              }, (err, result) => {
                res.redirect('/settings/profile');
              })
            }
          }
          else{
            res.redirect('/settings/profile');
          }
        }
      ]);
    },
    userUpload: function(req, res){
      const form = new formidable.IncomingForm();

      form.on('file', (field, file) => {
        //do nothing, the renaming is done in helpers/aws.js
      });

      form.on('error', (err) => {
        //do nothing
      });

      form.on('end', () => {
        //do nothing
      });
      form.parse(req);
    },
    overviewPage: function(req, res){
      async.parallel([
        function(callback){
          Users.findOne({'username':req.params.name})//search for the user
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
                //console.log(newResult1[0].body.sender);
                callback(err, newResult1);
              });
            }
          )
        },
      ], (err, results) => {
        const result1 = results[0];
        const result2 = results[1];
        res.render('user/overview', {title: 'SPORTbabble - Overview', user:req.user, data:result1, chat:result2});
      });
    },
    overviewPostPage: function(req, res){
      FriendResult.PostRequest(req, res, '/profile/' + req.params.name);
    }
  }
}
