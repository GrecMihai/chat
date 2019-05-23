$(document).ready(function(){
  var socket = io();

  var paramOne = $.deparam(window.location.pathname);//get the room name, aici e receiver.sender
  var newParam = paramOne.split('.');
  var username = newParam[0];//the receiver
  $('#receiver_name').text(username.replace(/-/g, " "));

  swap(newParam, 0, 1);//inverseaza cele 2 nume, astfel incat sa fie sender.receiver
  var paramTwo = newParam[0]+'.'+newParam[1];//aici va fi sender.receiver

  socket.on('connect', function(){
    var params = {
      room1: paramOne,
      room2: paramTwo
    }
    socket.emit('join PM', params);


    socket.on('message display', function(){
      $('#reload').load(location.href + ' ' + '#reload');
    });

    socket.on('new refresh', function(){
      $('#reload').load(location.href + ' ' + '#reload');
    });

  });

socket.on('new message', function(data){
  var template = $('#message-template').html();
  var message = Mustache.render(template, {
    text: data.text,
    sender: data.sender,
  });
  $('#messages').append(message);
})

  $('#message_form').on('submit', function(e){
    e.preventDefault();//so that the form wont be reloaded
    var msg = $('#msg').val();//store the data from the input field
    var sender = $('#name-user').val();
    //acest if verifica sa nu se poata trimite un mesaj care sa contina doar spatii
    if(msg.trim().length > 0){
      socket.emit('private message', {//first parameter is the event name, second parameter is the object sent to server
        text: msg,
        sender: sender,
        room: paramOne
      }, function(){
        $('#msg').val('');//clear the input field
      });
    }
  });
  //face vrajeala asta pt a salva mesajul cand se apasa pe Send, da ii acelasi lucru ca si cum ar fi pus functionalitatea mai sus, in form.submit, pt ca se declanseaza deodata
  $('#send-message').on('click', function(){
    var message = $('#msg').val();
    $.ajax({
      url: '/chat/' + paramOne,
      type: 'POST',
      data: {
        message: message
      },
      success: function(){
        $('#msg').val('');
      }
    });
  });
});
//value_1 si value_2 is indecsi, pur si simplu vrea sa le inverseze
function swap(input, value_1, value_2){
  var temp = input[value_1];
  input[value_1] = input[value_2];
  input[value_2] = temp;
}