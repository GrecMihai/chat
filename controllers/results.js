module.exports = function(async, Club, Users, Message, _){
  return {
    SetRouting: function(router){
      router.get('/results', this.getResults);
      router.post('/results', this.postResults);
      router.get('/friends', this.viewFriends);
      router.post('/friends', this.viewFriends);
    },
    getResults: function(req, res){
      if(typeof req.user !== "undefined"){
        res.redirect('/home');//ca sa nu poata ajunge la pagina aia decat daca apasa pe butonu de filter
      }
      else{
        res.render('error');
      }
    },
    postResults: function(req, res){
      if(/^\S*$/.test(req.body.country) === false){
        res.redirect('/home');
      }
      else if(req.body.country.length > 0){
      async.parallel([
        function(callback){
          const regex = new RegExp((req.body.country), 'gi');
          //prin or de mai jos il lasa sa caute ori dupa country ori dupa name, pt ca si filter si si bara de search au acelasi post method, si poate vrei sa cauti aici dupa nume, nu tara
          Club.find({'$or': [{'country':regex}, {'name':regex}, {'sport':regex}]}, (err, result) => {
            callback(err, result);
          })
        },
        function(callback){
          //console.log(req.user.username);
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
                          $gt:[
                          {$substr:["$senderName",0,1]},
                          {$substr:["$receiverName",0,1]}]
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
                //console.log(newResult1);
                callback(err, newResult1);
              });
            }
          )
        }
      ], (err, results) => {
        const res1 = results[0].sort(function compare(a, b) {
          return b.fans.length - a.fans.length;
        });
        const res2 = results[1];
        const res3 = results[2].sort(function compare(a, b) {
          var dateA = new Date(a.body.createdAt);
          var dateB = new Date(b.body.createdAt);
          return dateB - dateA;
        });

        const dataChunk = [];
        const chunkSize = 4;
        for(let i = 0; i < res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i, i + chunkSize));
        }
        res.render('results', {title: 'SPORTbabble - Results', chunks: dataChunk, user: req.user, data:res2, chat:res3});
      })
    }
    else{
      if(typeof req.user !== "undefined"){
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
              .populate('friendsList.friendId')
              .populate('sentRequest.user')
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
                            $gt:[
                            {$substr:["$senderName",0,1]},
                            {$substr:["$receiverName",0,1]}]
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
                  //console.log(newResult1);
                  callback(err, newResult1);
                });
              }
            )
          }
        ], (err, results) => {
          //get the result of all functions
          const res1 = results[0].sort(function compare(a, b) {
            return b.fans.length - a.fans.length;
          });
          const res2 = results[1];
          const res3 = results[2];
          const res4 = results[3].sort(function compare(a, b) {
            var dateA = new Date(a.body.createdAt);
            var dateB = new Date(b.body.createdAt);
            return dateB - dateA;
          });
          //ca sa afiseze cate 3 pe o linie, nu una sub alta la home page
          const dataChunk = [];
          const chunkSize = 3;
          for(let i = 0; i < res1.length; i+=chunkSize){
            dataChunk.push(res1.slice(i, i + chunkSize));
          }
          const countrySort = _.sortBy(res2, '_id');//sorting the countries
          //console.log(typeof req.user._id.toString());
          res.render('home', {title: 'Chat - Home', user:req.user, chunks: dataChunk, country: countrySort, data: res3, chat: res4});
        })
     }
     else{
       res.render('error');
     }
    }
    },
    viewFriends: function(req, res){
      if(typeof req.user !== "undefined"){
        async.parallel([
          function(callback){
            Users.find({'username':req.user.username})
            .populate('friendsList.friendId')
            .exec((err, result) => {
              callback(err, result);
            });
          },
          function(callback){
            //console.log(req.user.username);
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
                            $gt:[
                            {$substr:["$senderName",0,1]},
                            {$substr:["$receiverName",0,1]}]
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
                  //console.log(newResult1);
                  callback(err, newResult1);
                });
              }
            )
          }
        ], (err, results) => {
          const res1 = results[0][0].friendsList;
          const res2 = results[1];
          const res3 = results[2].sort(function compare(a, b) {
            var dateA = new Date(a.body.createdAt);
            var dateB = new Date(b.body.createdAt);
            return dateB - dateA;
          });
          const dataChunk = [];
          const chunkSize = 4;
          for(let i = 0; i < res1.length; i+=chunkSize){
            dataChunk.push(res1.slice(i, i + chunkSize));
          }
          res.render('friends', {title: 'SPORTbabble - Friends', chunks: dataChunk, user: req.user, data:res2, chat:res3});
        })
        }
      else{
        res.render('error');
      }
    }

  }
}
