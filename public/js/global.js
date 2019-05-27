$(document).ready(function(){
  var socket = io();

  socket.on('connect', function(){
    //se face un fel de connect la un global room, care e hardcodata aici, nu luata din DB ca si celelalte(vezi ce se inampla cand intri pe o camera)
    var room = 'GlobalRoom';
    var name = $('#name-user').val();
    var img = $('#name-image').val();
    socket.emit('global room', {
      room: room,
      name: name,
      img: img
    });

    socket.on('message display', function(){
      $('#reload').load(location.href + ' ' + '#reload');
    });
  });

  socket.on('loggedInUser', function(users){
    var friends = $('.friend').text();//asa se iau toti prietenii, pentru ca group.ejs a fost adaugat un div cu class=friend, ce are acesti precini, si cred ca cu @ se intampla ceva
    console.log(friends);
    var friend = friends.split('@');//are legatura cu cel @ pt ca altfel i'ar pune legati unu de celalant, si pt ca primul va deveni @, nu ii folosim numai de la index 1
    //acum verifici acesti friends daca exista in users, unde is toti utilizatorii ce sunt online, si asta e approach'ul pt afisarea utilizatorilor on the line
    var name = $('#name-user').val();//logged in user, the sender
    var ol = $('<div></div>');//aici se vor pune valorile ce se vor afisa
    var arr = []; //aici o sa fie precinii on the line
    for(var i = 0; i < users.length; i++){
      if(friend.indexOf(users[i].name) > -1){//mai mare decat -1 inseamna ca exista
        arr.push(users[i]);
        var userName = users[i].name;//friends name, the receiver
        var list = '<img src="https://grecmihaibucket.s3.amazonaws.com/' + users[i].img +'" class="pull-left img-circle" style="width:40px; height:40px; margin-right:10px;" /><p>' +
                  '<a id="val" href="/chat/'+ userName.replace(/ /g, "-") +'.'+name.replace(/ /g, "-")+ '"><h3 style="padding-top:15px;color:gray;font-size:14px;">' + users[i].name + '<span class="fa fa-circle online_friend"></span></h3></a></p>';
        ol.append(list);
      }
    }
    $('#numOfFriends').text('(' + arr.length + ')');
    $('.onlineFriends').html(ol);

  });
});
