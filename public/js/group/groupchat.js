$(document).ready(function(){
  var chat = document.getElementById("the_chat_area");
  chat.scrollTop = chat.scrollHeight;
  //this variable connects to the host that serves the page(pt ca nu i'ai pus URL la parametru)
  var socket = io();//this is possible because of the file added to the views(acel script)
  var room = $('#groupName').val();//get the group name from html
  var sender = $('#sender').val();
  var userPic = $('#name-image').val();
  //folosind functia asta stii cand userul intra intr'un grup chat, pt ca inseamna ca s'a conectat la acel chat
  socket.on('connect', function(){
    //console.log('User is connected');

    var params = {
      room: room,
      name: sender
    };
    //join event ca sa conectam cei ce sunt intr'un grup la un singur channel, altfel la emmit toti conectatii, indiferent de canal, primesc mesajul
    socket.emit('join', params, function(){//al 3lea argument e optional, si e un callback
      //console.log('User has joined this channel');
    });
  });

  socket.on('usersList', function(users){
    var ol = $('<ol></ol>');
    const uniqueUsers = [...new Set(users)];
    for(var i = 0; i < uniqueUsers.length; i++){
      ol.append('<p><a id="val" data-toggle="modal" data-target="#myModal">'+uniqueUsers[i]+'</a></p>');
    }
    //jquery event delegation to add dinamically the name of the user in the modal
    $(document).on('click', '#val', function(){
      var senderName = $('#sender-name').val();
      var areFriends = false;
      if($(this).text() === senderName){
        $('#friend-add').hide();
        $('#nameLink').hide();
      }
      else{
        $('#friend-add').show();
        $('#nameLink').show();
      }
      $('#name').text($(this).text());//this get the text from the currently clicked element
      $('#receiverName').val($(this).text());//ceva valoare hidden, utilizata la emitere la socket io
      $('#nameLink').attr("href", "/profile/"+$(this).text());//pentru cand apesi pe butonul de profil, sa te duca la el
    });

    $('#users').html(ol);
    $('#numValue').text('(' + uniqueUsers.length + ')');
  });

  socket.on('newMessage', function(data){
      var template = $('#message-template').html();
      var message = Mustache.render(template, {
        text: data.text,
        sender: data.from,
        userImage: data.image
      });
      $('#messages').append(message);
      chat.scrollTop = chat.scrollHeight;
  });


  //jquery, getting the id of the form and listen on submit on that form
  $('#message-form').on('submit', function(e){

    e.preventDefault();//so that the form wont be reloaded
    var msg = $('#msg').val();//store the data from the input field
    socket.emit('createMessage', {//first parameter is the event name, second parameter is the object sent to server
      text: msg,
      room: room,
      from: sender,
      userPic: userPic
    }, function(){
      //to clear the input field, ceva
      $('#msg').val('');
    });
    $.ajax({
      url: '/group/'+room,
      type: 'POST',
      data: {
        message: msg,
        groupName: room.replace(/-/g, " "),
      },
      success: function(){
        $('#msg').val('');
      }
    })

  });
});
