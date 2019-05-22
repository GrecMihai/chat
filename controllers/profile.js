module.exports = function(async, Users, Message, aws, formidable){
  return {
    SetRouting: function(router){
      router.get('/settings/profile', this.getProfilePage);

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
        res.render('user/profile', {title: 'SPORTbabble - Profile', user:req.user, data:result1, chat:result2});
      });
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
    }

  }
}
