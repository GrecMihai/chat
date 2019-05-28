const User = require('../models/user');

module.exports = function(io, Users){

  const users = new Users();

  //cu asta stii ca s'a conectat un user
  io.on('connection', (socket) => {
    //console.log('User connected');
    //!!!!!!!!!tot ce ascultam va fi inauntrul conexiunii
    socket.on('join', (params, callback) => {//callback pt ca am adaugat acel al 3lea parametru la client, si atunci trebuie adaugat si aici
      socket.join(params.room);//allows sockets to connect to a particular channel, and takes in a room name
      users.AddUserData(socket.id, params.name, params.room);
      User.findOne({'username':params.name})
      .populate('request.userId')
      .populate('friendsList.friendId')
      .populate('sentRequest.user')
      .exec((err, result) => {
        io.to(params.room).emit('usersList', {friends: result.friendsList, users:users.GetUsersList(params.room)});
        callback();
      });
      //console.log(users);
      //say to all users when a new user has joined the channel

    });
    socket.on('createMessage', (message, callback) => {
      //console.log(message.text);
      io.to(message.room).emit('newMessage', {//functia to e pentru a emite mesajele doar pt un anumit room
        text: message.text,
        room: message.room,
        from: message.from,
        image: message.userPic
      });//emit a event to all the clients that are on a particular channel, including the one that emitted the message
      callback();//daca nu faci asta, mesajul nu se sterge, chiar daca tu pe partea de client ai dat acel $...('')
    });//in loc de io, pt ca vrem eventul from a particular socket

    socket.on('disconnect', () => {
      var user = users.RemoveUser(socket.id);
      //ca sa ii anunti si pe ceilalti ca a iesit nebunu
      if(user){
        User.findOne({'username':user.name})
        .populate('request.userId')
        .populate('friendsList.friendId')
        .populate('sentRequest.user')
        .exec((err, result) => {
          io.to(user.room).emit('usersList', {friends: result.friendsList, users:users.GetUsersList(user.room)});
        });
      }
    });

  });

}
