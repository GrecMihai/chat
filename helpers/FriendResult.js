//cod pt acceptarea friend request, ce e in navbar si trebuie util in toate paginile
module.exports = function(async, Users, Message){
  return {
    PostRequest: function(req, res, url){
      //here you will post the data to the database(sending the friend request)
      async.parallel([
        //for receiver
        function(callback){
          if(req.body.fr_receiverName){
            //update the collection for the receiver
            Users.update({
              'username': req.body.fr_receiverName,//look for a collection that has that Username
              'request.userId': {$ne: req.user._id},//ne inseamna not equal, _id e id'ul celui ce trimite, prin asta verifica ca nu s'a trimis deja cerere sau ca ei nu sunt deja prieteni
              'friendsList.friendId' : {$ne: req.user._id},//aici verifica sa nu fie prieteni de fapt

            },
              {
                $push: {request: {
                  userId: req.user._id,
                }},
                $inc: {totalRequest: 1}
              }, (err, count) => {
                callback(err, count);
              })
          }
        },
        //for sender
        function(callback){
          Users.findOne({'username':req.body.fr_receiverName}, (err, user) => {
            if(user){
              Users.update({
                'username': req.user.username,//verificam sa fie userul care trebuie
                'sentRequest.username': {$ne: req.body.fr_receiverName}//sa verificam ca nu s'a tirmis deja o cerere si baiatu celalant nu a acceptat'o
              },{//push the data here
                $push: {sentRequest: {
                  user: user._id
                }}
              }, (err, count) => {
                callback(err, count);
              })
          }
        })
        }
      ], (err, results) => {
        res.redirect(url);//il trimiti inapoi la grup
      });

      //accepting and cancelling the friend request
      async.parallel([

        //CLICK ON ACCEPT
        //update the document for the receiver request
        function(callback){
                    if(req.body.fr_senderId){
                        Users.update({
                            '_id': req.user._id,
                            'friendsList.friendId': {$ne: req.body.fr_senderId}
                        }, {
                            $push: {friendsList: {
                                friendId: req.body.fr_senderId
                            }},
                            $pull: {request: {
                                userId: req.body.fr_senderId,
                            }},
                            $inc: {totalRequest: -1}
                        }, (err, count) => {
                            callback(err, count);
                        });
                    }
                },

                //This function is updated for the sender of the friend request when it is accepted by the receiver
                function(callback){
                    if(req.body.fr_senderId){
                        Users.update({
                            '_id': req.body.fr_senderId,
                            'friendsList.friendId': {$ne: req.user._id}
                        }, {
                            $push: {friendsList: {
                                friendId: req.user._id
                            }},
                            $pull: {sentRequest: {
                                user: req.user._id
                            }},
                        }, (err, count) => {
                          callback(err, count);
                        });
                    }
                },
        //CANCEL THE REQUEST
        //receiver
        function(callback){
          if(req.body.fr_user_Id){
            Users.update({
              '_id': req.user._id,
              'request.userId' : {$eq: req.body.fr_user_Id}
            },{//delete the request
              $pull: {request: {
                userId: req.body.fr_user_Id
              }},
              $inc: {totalRequest: -1}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        //sender
        function(callback){
          if(req.body.fr_user_Id){
            Users.update({
              '_id': req.body.fr_user_Id,
              'sentRequest.user' : {$eq: req.user._id}
            },{//delete the request
              $pull: {sentRequest: {
                user: req.user._id
              }}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        function(callback){
          //update the message so that it is seen
          if(req.body.receiverId && req.body.receiverId == req.user._id){
            Message.update({
              'receiver': req.body.receiverId,
              'sender': req.body.senderId
            },
            {
              "isRead": true
            },{"multi": true}, (err, done) => {
              callback(err, done);
            })
          }
        }
      ], (err, results) => {
        res.redirect(url);
      });
    }
  }
}
