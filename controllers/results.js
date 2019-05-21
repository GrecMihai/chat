module.exports = function(async, Club, Users){
  return {
    SetRouting: function(router){
      router.get('/results', this.getResults);
      router.post('/results', this.postResults);
      router.get('/members', this.viewMembers);
      router.post('/members', this.searchMembers);
    },
    getResults: function(req, res){
      res.redirect('/home');//ca sa nu poata ajunge la pagina aia decat daca apasa pe butonu de filter
    },
    postResults: function(req, res){
      async.parallel([
        function(callback){
          const regex = new RegExp((req.body.country), 'gi');
          //prin or de mai jos il lasa sa caute ori dupa country ori dupa name, pt ca si filter si si bara de search au acelasi post method, si poate vrei sa cauti aici dupa nume, nu tara
          Club.find({'$or': [{'country':regex}, {'name':regex}, {'sport':regex}]}, (err, result) => {
            callback(err, result);
          })
        }
      ], (err, results) => {
        const res1 = results[0];

        const dataChunk = [];
        const chunkSize = 4;
        for(let i = 0; i < res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i, i + chunkSize));
        }
        res.render('results', {title: 'SPORTbabble - Results', chunks: dataChunk, user: req.user});
      })
    },
    viewMembers: function(req, res){
      async.parallel([
        function(callback){
          Users.find({}, (err, result) => {
            callback(err, result);
          })
        }
      ], (err, results) => {
        const res1 = results[0];

        const dataChunk = [];
        const chunkSize = 4;
        for(let i = 0; i < res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i, i + chunkSize));
        }
        res.render('members', {title: 'SPORTbabble - Members', chunks: dataChunk, user: req.user});
      })
    },
    searchMembers: function(req, res){
      async.parallel([
        function(callback){
          const regex = new RegExp((req.body.username), 'gi');
          Users.find({'username':regex}, (err, result) => {
            callback(err, result);
          })
        }
      ], (err, results) => {
        const res1 = results[0];

        const dataChunk = [];
        const chunkSize = 4;
        for(let i = 0; i < res1.length; i+=chunkSize){
          dataChunk.push(res1.slice(i, i + chunkSize));
        }
        res.render('members', {title: 'SPORTbabble - Members', chunks: dataChunk, user: req.user});
      })
    }
  }
}
