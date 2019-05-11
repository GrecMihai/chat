module.exports = function(async, Users){
  return {
    SetRouting: function(router){
      router.get('/chat/:name', this.getchatPage);
    },
    getchatPage: function(req, res){
      async.parallel([
        function(callback){
          Users.findOne({'username':req.user.username})//search for the user
            .populate('request.userId')//for that particular user, if the user already has a friend request, is going to populate that field userId, with all the data of the user that send the friend request
            .exec((err, result) => {
              callback(err, result);
            });
        }
      ], (err, results) => {
        const result1 = results[0];
        res.render('private/privatechat', {title: 'SPORTbabble - Private Chat', user:req.user, data:result1});
      });
    }
  }
}
