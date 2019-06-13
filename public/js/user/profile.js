//o sa fie AJAX code here si jquery
//acest cod face ca atunci cand apesi pe butonul de upload sa se triggaruiasca chestia aia care deschide directorul ca sa faci upload
//acel . inseamna ca e vorba de o clasa, iar #de un id, asa se identifica obiectele din acel ejs, ca si cum faceai tu in DOM
$(document).ready(function(){
  $('.add-btn').on('click', function(){
    //console.log('Am apasat bestia');
    $('#add-input').click();
  });
  //verifica daca s'a introdus acea poza, si va trimite de la client la server poza
  $('#add-input').on('change', function(){
    var uploadInput = $('#add-input');
    //doar daca nu e empty
    if(uploadInput.val() != ''){
      //ceva cu javascript form data, ca sa iti trimita cu XMLHttpRequest datele
      var formData = new FormData();

      formData.append('upload', uploadInput[0].files[0]);
      $('#completed').html('File Uploaded Successfully');

      $.ajax({
        url:'/userupload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(){
          uploadInput.val('');//dupa ce se trimite, resetam input fieldul
        }
      })
    }
    ShowImage(this);
  });

  $('#password_button').on('click', function(){
    var old_password = $('#old_password').val();
    var new_password = $('#new_password').val();

    $.ajax({
      url: '/settings/profile',
      type: 'PUT',
      data: {
        old_password: old_password,
        new_password: new_password
      },
      success: function(){
        $('#old_password').val('');
        $('#new_password').val('');
        window.location.reload();
        //window.scrollTo(0,0);
      }
    })
  });

  $('#profile').on('click', function(){
    var username = $('#username').val();
    var fullname = $('#fullname').val();
    var country = $('#country').val();
    var gender = $('#gender').val();
    var mantra = $('#mantra').val();
    var userImage = $('#add-input').val();
    var image = $('#user-image').val();

    var valid = true;
    if(userImage === ''){
      $('#add-input').val(image);
    }

    if(username == '' || fullname == '' || country =='' || gender == '' || mantra == ''){
      valid = false;
      $('#error').html('<div class="alert alert-danger"> You can not submit an empty field </div>');
    }
    else{
      userImage = $('#add-input').val();
      $('#error').html('');//clear the error
    }
    if(valid === true){
      $.ajax({
        url: '/settings/profile',
        type: 'POST',
        data: {
          username: username,
          fullname: fullname,
          country: country,
          gender: gender,
          mantra: mantra,
          upload: userImage
        },
        success: function(){
          //set a timer to automatically load the page and see the changes
          setTimeout(function(){
            window.location.reload();
          }, 200);
        }
      })
    }
    else{
      return false;
    }
  });
});


function ShowImage(input){
  //se asigura ca daca se adauga mai multe poze, se ia doar prima
  if(input.files && input.files[0]){
    var reader = new FileReader();
    reader.onload = function(e){
      $('#show_img').attr('src', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
  }
}
