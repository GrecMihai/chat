module.exports = function(io){
  io.on('connection', (socket) => {
    socket.on('joinRequest', (myRequest, callback) => {
      socket.join(myRequest.sender);
      callback();
    });

    socket.on('friendRequest', (friend, callback) => {
      io.to(friend.receiver).emit('newFriendRequest', {
        from: friend.sender,
        to: friend.receiver
      });

      callback();//pt ca dincolo ai adaugat si acel al 3lea parametru, acea functie cu console.log
    });
  });
}
