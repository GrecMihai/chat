//module ce vor fi utilizate doar aici, de aceea nu sunt adaugate in container.js
const express = require('express');
const ejs = require('ejs');//templating engine(???)
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');//allow us to display flash messages
const passport = require('passport');
const socketIO = require('socket.io');
const {Users} = require('./helpers/Group');//asa se face la clase
const {Global} = require('./helpers/Global');


const container = require('./container');

container.resolve(function(users, _, admin, home, group, results, privatechat, profile){

  mongoose.Promise = global.Promise;//require for mongoose to work
  //mongoose.connect('mongodb+srv://root:root@sportbabble-iwgef.mongodb.net/test?retryWrites=true&w=majority', {useMongoClient: true});//added path to the database
  mongoose.connect(process.env.MONGODB_URI);

  const app = SetupExpress();

  function SetupExpress(){
    //ciudata abordare, ai putea sa faci direct fara functia aia de mai sus
    const app = express();
    const server = http.createServer(app);
    /*
    const server = https.createServer({
      key: fs.readFileSync('certificates/server.key'),
      cert: fs.readFileSync('certificates/server.cert')
    },app);*/
    const io = socketIO(server);
  /*
    server.listen(3000, function(){
      console.log('Server listening on port 3000');
    });
    */
    server.listen(process.env.PORT || 3000, function(){
      console.log('Server listening on port 3000');
    });
    ConfigureExpress(app);

    require('./socket/groupchat')(io, Users);
    require('./socket/friend')(io);
    require('./socket/globalroom')(io, Global, _);
    require('./socket/privatemessage')(io);
    //Setup router
    const router = require('express-promise-router')();
    users.SetRouting(router);
    admin.SetRouting(router);
    home.SetRouting(router);
    group.SetRouting(router);
    results.SetRouting(router);
    privatechat.SetRouting(router);
    profile.SetRouting(router);
    app.use(router);

    app.use(function(req, res){
      res.render('404');
    })

  }
  //add the MiddleWares
  function ConfigureExpress(app){

    require('./passport/passport-local');
    require('./passport/passport-facebook');
    require('./passport/passport-google');
    //setting the MiddleWares
    app.use(express.static('public'));//express will make use of every static file in the public folder
    app.use(cookieParser());//allow us to save cookies in the browser
    app.set('view engine', 'ejs');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));


    app.use(validator());//validates whatever data we save on the database
    app.use(session({//allow us to save the sessions
      secret: process.env.SECRET_KEY,
      //secret: 'my_secret_key',
      resave: true,
      saveInitialized: true,
      stroe: new MongoStore({mongooseConnection: mongoose.connection})//with this the data will be saved in the db for later reuse
    }));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals._ = _;//asa _(lodash) devine variabila globala, si poate fi utilizata in orice fisier din proiect, inclusiv in ejs-uri

  }

});
