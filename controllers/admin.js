

module.exports = function(formidable, Club, aws){
    return {
      SetRouting: function(router){
        router.get('/dashboard', this.getAdminPage);

        router.post('/uploadFile',aws.Upload.any(), this.uploadFile);//any() so you can upload any type of files
        router.post('/dashboard', this.postAdminPage);
      },


      getAdminPage: function(req, res){
        res.render('admin/dashboard');
      },
      postAdminPage: function(req, res){
        const newClub = new Club();
        newClub.name = req.body.club;//le ia din ceva atribut(name) din ejs
        newClub.country = req.body.country;
        newClub.image = req.body.upload;
        newClub.sport = req.body.sport;
        newClub.save((err) => {
          res.render('admin/dashboard');//va trebui sa afisezi si ceva mesaje
        })
      },
      uploadFile: function(req, res){
        const form = new formidable.IncomingForm();
        //form.uploadDir = path.join(__dirname, '../public/uploads');
        //listen on events
        form.on('file', (field, file) => {
          //fs.rename(file.path, path.join(form.uploadDir, file.name), (err)=>{
            //if(err){
              //throw err;
            //}
            //console.log('file renamed successfuly');
          //})
        });
        form.on('error', (err) => {
          //console.log(err);
        });
        form.on('end', () => {
          //console.log('file upload is successful');
        });
        form.parse(req);
      }
    }
}
