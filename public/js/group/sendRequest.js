$(document).ready(function(){
  var socket = io();

  var room = $('#groupName').val()
  var sender = $('#sender').val();
  //pt ca folosesti un fisier separat, trebuie sa faci iar acel join event
  socket.on('connect', function(){
    var params = {
      sender: sender
    }
    socket.emit('joinRequest', params, function(){
      //console.log('Joined');
    });
  });

  socket.on('newFriendRequest', function(friend){
    $('#reload').load(location.href + ' ' + '#reload');
    //event delegation si aici, ii bagata si aici ca sa poti sa dai accept fara sa dai refresh
    $(document).on('click', '#accept_friend', function(){
      var senderId = $('#senderId').val();
      var senderName = $('#senderName').val();

      $.ajax({
        url: '/group/' + room,
        type: 'POST',
        data: {
          senderId: senderId,
          senderName: senderName
        },
        success: function(){
          //after the data is sent, we remove the request from the frontend
          $(this).parent().eq(1).remove();
        }
      });
      $('#reload').load(location.href + ' ' + '#reload');
    });
    $(document).on('click', '#cancel_friend', function(){
      var user_Id = $('#user_Id').val();
      $.ajax({
        url: '/group/' + room,
        type: 'POST',
        data: {
          user_Id: user_Id
        },
        success: function(){
          //after the data is sent, we remove the request from the frontend
          $(this).parent().eq(1).remove();
        }
      });
      $('#reload').load(location.href + ' ' + '#reload');
    });
  });


  $('#add_friend').on('submit', function(e){
    e.preventDefault();//prevent form from reloading
    var receiverName = $('#receiverName').val();

    $.ajax({
      url: '/group/'+room,
      type: 'POST',
      data: {
        receiverName: receiverName
      },
      success: function(){
        //datele de sus se trimit la DB, dupa ce sunt trimise, trebuie sa emitem un nou event
        socket.emit('friendRequest', {//this event is for showing a real time notification
          receiver: receiverName,
          sender: sender
        }, function(){
          //console.log('Request Sent');
        });

      }
    })
  });

  $('#accept_friend').on('click', function(){
    var senderId = $('#senderId').val();
    var senderName = $('#senderName').val();
    $.ajax({
      url: '/group/' + room,
      type: 'POST',
      data: {
        senderId: senderId,
        senderName: senderName
      },
      success: function(){
        //after the data is sent, we remove the request from the frontend
        $(this).parent().eq(1).remove();
        //also, if it is the case, reload the online friends box
      }
    });
    $('#reload').load(location.href + ' ' + '#reload');
  });
  $('#cancel_friend').on('click', function(){

    var user_Id = $('#user_Id').val();

    $.ajax({
      url: '/group/' + room,
      type: 'POST',
      data: {
        user_Id: user_Id
      },
      success: function(){
        //after the data is sent, we remove the request from the frontend
        $(this).parent().eq(1).remove();
      }
    });
    $('#reload').load(location.href + ' ' + '#reload');
  });
});
