module.exports = function(async, Users, Message, FriendResult){
  return {
    SetRouting: function(router){
      router.get('/settings/interests', this.getInterestPage);
      router.post('/settings/interests', this.postInterestPage)
    },
    getInterestPage: function(req, res){
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
              callback(err, newResult);
            }
          )
        },
      ], (err, results) => {
        const result1 = results[0];
        const result2 = results[1];
        res.render('user/interest', {title: 'SPORTbabble - Interests', user:req.user, data:result1, chat:result2});
      });
    },
    postInterestPage: function(req, res){
      FriendResult.PostRequest(req, res, '/settings/interests');

      async.parallel([
        function(callback){
          if(req.body.favPlayer){
            Users.update({
              '_id':req.user._id,
              'favPlayers.playerName': {$ne: req.body.favPlayer}
            },
            {
              $push: {favPlayers: {
                playerName: req.body.favPlayer
              }}
            }, (err, result1) => {
              callback(err, result1);
            })
          }
        }
      ], (err, results) => {
        res.redirect('/settings/interests');
      });
    }
}
}
