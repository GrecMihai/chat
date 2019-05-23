module.exports = function(io, Global, _){
  const clients = new Global();

  io.on('connection', (socket) => {
    socket.on('global room', (global) => {
      socket.join(global.room);
      clients.EnterRoom(socket.id, global.name, global.room, global.img);

      var nameProp = clients.GetRoomList(global.room);
      /*
        Din pacate, de fiecare data cand dai refresh, sau ma rog cand ajungi la pagina principala, el o sa iti bage iar valorile in acea clasa Global, functia de mai jos o sa faca astfel incat
        sa fie returnate doar valorile din Arr ce au name unic
      */
      const arr = _.uniqBy(nameProp, 'name');
      //console.log(arr);

      io.to(global.room).emit('loggedInUser', arr);

    });
    socket.on('disconnect', () => {
      var user = clients.RemoveUser(socket.id);
      //ca sa ii anunti si pe ceilalti ca a iesit nebunu
      if(user){
        var userData = clients.GetRoomList(user.room);
        const arr = _.uniqBy(userData, 'name');
        const removeData = _.remove(arr, {'name':user.name});
        io.to(user.room).emit('loggedInUser', removeData);
      }
    });
  });
}
