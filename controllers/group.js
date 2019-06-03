module.exports = function(Users, async, Message, FriendResult, Group, Club){
  return {
    SetRouting: function(router){
      router.get('/group/:name', this.groupPage);//name va fi diferit pt fiecare jucator
      router.post('/group/:name', this.groupPostPage);
      router.get('/logout', this.logout);
    },
    groupPage: function(req, res){
      const name =  req.params.name;//name pt ca ai :name mai sus

      if(typeof req.user !== "undefined"){
        Club.findOne({"name": name.replace(/-/g, " ")}, (err, result) => {
          if(result !== null){
            //get the data of every logged in user
            async.parallel([
              function(callback){
                Users.findOne({'username':req.user.username})//search for the user
                .populate('request.userId')
                .populate('friendsList.friendId')
                .populate('sentRequest.user')//for that particular user, if the user already has a friend request, is going to populate that field userId, with all the data of the user that send the friend request
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
              function(callback){
                Group.find({})
                  .populate('sender')
                  .exec((err, result) => {
                    callback(err, result);
                  });
              }
            ], (err, results) => {
              const result1 = results[0];
              const result2 = results[1];
              const result3 = results[2];
              //console.log(result3);
              res.render('groupchat/group', {title: 'SPORTbabble - Group', user:req.user, groupName:name, data:result1, chat:result2, groupMsg: result3});
            });
          }
          else{
            res.render('error');
          }
        });
      }
      else{
        res.render('error');
      }
    },
    groupPostPage: function(req, res){
      FriendResult.PostRequest(req, res, '/group/'+req.params.name);

      async.parallel([
        function(callback){
          if(req.body.message){
            const group = new Group();
            group.sender = req.user._id;//logged in user
            group.body = req.body.message;
            group.name = req.body.groupName;
            group.createdAt = new Date();

            group.save((err, msg) => {
              callback(err, msg);
            })
          }
        }
      ], (err, results) => {
        res.redirect('/group/'+req.params.name);
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
