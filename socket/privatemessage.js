module.exports = function(io){
  io.on('connection', (socket) => {
    socket.on('join PM', (pm) => {

      socket.join(pm.room1);
      socket.join(pm.room2);

    });
    socket.on('private message', (message, callback) => {
      //o sa mearga la ambii pt ca ei mai sus au dat join si la room1, si la room2, deci oricare dintre ele putea fi utilizata pt message.room
      io.to(message.room).emit('new message', {
        text: message.text,
        sender: message.sender
      });

      callback();//asta se face pt ca dincolo tu ai si un callback, si daca nu faci asta aici ala nu va fi apelat
    });
  });
}
