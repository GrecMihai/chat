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
  })
})
