module.exports = function(async, Users, Message, FriendResult){
  return {
    SetRouting: function(router){
      router.get('/chat/:name', this.getchatPage);
      router.post('/chat/:name', this.chatPostPage);
    },
    getchatPage: function(req, res){
      async.parallel([
        function(callback){
          Users.findOne({'username':req.user.username})//search for the user
          .populate('request.userId')
          .populate('friendsList.friendId')
          .populate('sentRequest.user')//for that particular user, if the user already has a friend request, is going to populate that field userId, with all the data of the user that send the friend request
            .exec((err, result) => {
              callback(err, result);
            })
        },

        //fetch all the messages for a single conversation
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

        function(callback){
          //go into the message collection, find every document that has senderName or receiverName equal with the user's username, in each document it will populate the sender and receiver field
          //(adica ia toate informatiile despre sender si receiver din colectia users)
          Message.find({'$or':[{'sender':req.user._id}, {'receiver':req.user._id}]})
            .populate('sender')
            .populate('receiver')
            .exec((err, result3) => {
              //console.log(result3);
              callback(err, result3);
            });
        }
      ], (err, results) => {
        const result1 = results[0];
        const result2 = results[1];
        const result3 = results[2];
        const params = req.params.name.split('.');
        const nameParams = params[0].replace(/-/g, " ");//this is the receiver name
        res.render('private/privatechat', {title: 'SPORTbabble - Private Chat', user:req.user, data:result1, chat:result2, chats:result3, name:nameParams});
      });
    },
    chatPostPage: function(req, res, next){
      const params = req.params.name.split('.');
      const nameParams = params[0].replace(/-/g, " ");//this is the receiver name
      const nameRegex = new RegExp("^"+nameParams.toLowerCase(), "i");
      //waterfall, the result of the first function will be passed to the second function to make use of it
      async.waterfall([
        //prima functie ia din baza de date datele despre receiver
        function(callback){
          if(req.body.message){
            //console.log(nameRegex);
            Users.findOne({'username': {$regex: nameRegex}}, (err, data) => {
              callback(err, data);
            });
          }
        },

        function(data, callback){
          if(req.body.message){
            const newMessage = new Message();
            newMessage.sender = req.user._id;//in req.user se stocheaza datele de la useurl logat, based on passport that we used
            newMessage.receiver = data._id;
            newMessage.message = req.body.message;
            newMessage.createdAt = new Date();//now
            newMessage.save((err, result) => {
              if(err){
                return next(err);
              }
              callback(err, result);
            })
          }
        }
      ], (err, results) => {
        res.redirect('/chat/'+req.params.name);
      });
      FriendResult.PostRequest(req, res, '/chat/'+req.params.name);
    }
  }
}
