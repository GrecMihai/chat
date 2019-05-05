
 module.exports = function(_, async, Club){
   return {
     SetRouting: function(router){
       router.get('/home', this.homePage);
     },

     homePage: function(req, res){
       //this allows each function to run in parallel
       async.parallel([
         function(callback){
           //find all the data
           Club.find({}, (err, result) => {
             callback(err, result);
           });
         },
         //to aggregate DB based on country
         function(callback){
           Club.aggregate([{
             $group: {
               _id: "$country"
             }
           }], (err, newResult) => {
             callback(err, newResult);
           });
         }
       ], (err, results) => {
         //get the result of first function
         const res1 = results[0];
         const res2 = results[1];
         //ca sa afiseze cate 3 pe o linie, nu una sub alta la home page
         const dataChunk = [];
         const chunkSize = 3;
         for(let i = 0; i < res1.length; i+=chunkSize){
           dataChunk.push(res1.slice(i, i + chunkSize));
         }
         const countrySort = _.sortBy(res2, '_id');//sorting the countries

         res.render('home', {title: 'Chat - Home', user:req.user, data: dataChunk, country: countrySort});
       })
     }
   }
 }
