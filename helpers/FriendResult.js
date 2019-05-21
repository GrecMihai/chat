//cod pt acceptarea friend request, ce e in navbar si trebuie util in toate paginile
module.exports = function(async, Users, Message){
  return {
    PostRequest: function(req, res, url){
      //here you will post the data to the database(sending the friend request)
      async.parallel([
        //for receiver
        function(callback){
          if(req.body.receiverName){
            //update the collection for the receiver
            Users.update({
              'username': req.body.receiverName,//look for a collection that has that Username
              'request.userId': {$ne: req.user._id},//ne inseamna not equal, _id e id'ul celui ce trimite, prin asta verifica ca nu s'a trimis deja cerere sau ca ei nu sunt deja prieteni
              'friendsList.fiendId' : {$ne: req.user._id},//aici verifica sa nu fie prieteni de fapt

            },
              {
                $push: {request: {
                  userId: req.user._id,
                  username: req.user.username
                }},
                $inc: {totalRequest: 1}
              }, (err, count) => {
                callback(err, count);
              })
          }
        },
        //for sender
        function(callback){
          if(req.body.receiverName){
            Users.update({
              'username': req.user.username,//verificam sa fie userul care trebuie
              'sentRequest.username': {$ne: req.body.receiverName}//sa verificam ca nu s'a tirmis deja o cerere si baiatu celalant nu a acceptat'o
            },{//push the data here
              $push: {sentRequest: {
                username: req.body.receiverName
              }}
            }, (err, count) => {
              callback(err, count);
            })
          }
        }
      ], (err, results) => {
        res.redirect(url);//il trimiti inapoi la grup
      });

      //accepting and cancelling the friend request
      async.parallel([
        //CLICK ON ACCEPT
        //update the document for the receiver request
        function(callback){
          if(req.body.senderId){
            Users.update({
              '_id': req.user._id,
              'friendsList.friendId' : {$ne: req.body.senderId}
            },{//add to the friends list
              $push: {friendsList: {
                friendId: req.body.senderId,
                friendName: req.body.senderName
              }},//delete the request
              $pull: {request: {
                userId: req.body.senderId,
                username: req.body.senderName
              }},//decrement the totalRequest
              $inc: {totalRequest: -1}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        //update the document for the sender request
        function(callback){
          if(req.body.senderId){
            Users.update({
              '_id': req.body.senderId,
              'friendsList.friendId' : {$ne: req.user._id}
            },{//add to the friends list
              $push: {friendsList: {
                friendId: req.user._id,
                friendName: req.user.username
              }},//delete the request
              $pull: {sentRequest: {
                username: req.user.username
              }}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        //CANCEL THE REQUEST
        //receiver
        function(callback){
          if(req.body.user_Id){
            Users.update({
              '_id': req.user._id,
              'request.userId' : {$eq: req.body.user_Id}
            },{//delete the request
              $pull: {request: {
                userId: req.body.user_Id
              }},
              $inc: {totalRequest: -1}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        //sender
        function(callback){
          if(req.body.user_Id){
            Users.update({
              '_id': req.body.user_Id,
              'sentRequest.username' : {$eq: req.user.username}
            },{//delete the request
              $pull: {sentRequest: {
                username: req.user.username
              }}
            }, (err, count) => {
              callback(err, count);
            });
          }
        },
        function(callback){
          //update the message so that it is seen
          if(req.body.chatId){
            Message.update({
              '_id': req.body.chatId
            },
            {
              "isRead": true
            }, (err, done) => {
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
