$(document).ready(function(){
  $('#favPlayerBtn').on('click', function(){
    var favPlayer = $('#favPlayer').val();
    var valid = true;
    if(favPlayer === ''){
      valid = false;
      $('#error').html('<div class="alert alert-danger"> You can not submit an empty field </div>');
    }
    else{
      $('#error').html('');
    }
    if(valid === true){
      $.ajax({
        url: '/settings/interests',
        type: 'POST',
        data: {
          favPlayer: favPlayer
        },
        success: function(){
          setTimeout(function(){
            window.location.reload();
          }), 200;
        }
      })
    }
    else{
      return false;
    }
  })
});
