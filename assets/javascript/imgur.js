//Called when filereader has processed image
//Requires an event from a FileReader onloadend event
//Sends Base64 data to Imgur
//Puts image in the DOM on an element with the Id displayImage
function gotImage(event) {
  var reader = event.target;
  // displayPic(reader.result);
  var base64result = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
  if (base64result.length < 5333333) {
    console.log("Image is less than 4MB")
    queryVisionAPI(base64result);
  } else {
    console.log("Image is greater than 4MB, wait for Imgur")
    var form = new FormData();
    form.append("image", base64result);

    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://api.imgur.com/3/image",
      "method": "POST",
      "headers": {
        "authorization": `Client-ID ${apiKey.imgur_client_id}`
      },
      "processData": false,
      "contentType": false,
      "mimeType": "multipart/form-data",
      "data": form
    }

    $.ajax(settings).done(function(response) {
      var res = JSON.parse(response);
      queryVisionAPI(res.data.link);
      console.log(res.data.link);
    });
  }
}

//Displays picture on the page
//picture is a valid string for that an image src tag can use
function displayPic(picture) {
  $("#displayImage").attr("src", picture);
  $("#displayImage").removeClass("hidden");
  $("#drag").removeClass("uploadWanted");
}

//Make sure that a file is an image and if so sends to the FileReader
//file is a valid file blob
function readPic(file) {
  console.log(file);
  var fileType = file["type"].split("/")[0];
  if (fileType !== "image") {
    console.log("Not an image")
  } else {
    loadImage.parseMetaData(file, function(data) {
      //default image orientation
      var orientation = 0;
      //if exif data available, update orientation
      if (data.exif) {
        orientation = data.exif.get('Orientation');
      }
      var loadingImage = loadImage(
        file,
        function(canvas) {
          //here's the base64 data result
          var base64data = canvas.toDataURL('image/jpeg');
          //here's example to show it as on imae preview
          var img_src = base64data.replace(/^data\:image\/\w+\;base64\,/, '');
          displayPic(base64data);
        }, {
          //should be set to canvas : true to activate auto fix orientation
          canvas: true,
          orientation: orientation
        }
      );
    });
    var reader = new FileReader();
    reader.onload = gotImage;
    reader.readAsDataURL(file);

  }
}

$(document).ready(function addUpload() {

  var imgur_client_id = "cffdbdcf9cb88c7";
  var imgur_sec = "4e806c50fb260cc521bfe11d4e7edfa22cfbf684";
  var authURL = "https://api.imgur.com/oauth2/authorize?client_id=" + imgur_client_id + "&response_type=token"
  var auth_token = ""

  var refreshForm = new FormData();
  refreshForm.append("refresh_token", "4c771b1e1055e3eb3adee452a2155ebd258392d1");
  refreshForm.append("client_id", "cffdbdcf9cb88c7");
  refreshForm.append("client_secret", "4e806c50fb260cc521bfe11d4e7edfa22cfbf684");
  refreshForm.append("grant_type", "refresh_token");

  $("#drag").on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragover');
    $(this).css('border', '2px solid #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.6)');
    $(this).css('color', '#173848');
  });
  $("#drag").on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('dragleave');
    $(this).css('border', '2px dotted #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.4)');
    $(this).css('color', '#31708f');
  });
  $("#drag").on('drop', function(e) {

    $(this).css('border', '2px dotted #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.4)');
    $(this).css('color', '#31708f');
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;

    //We need to send dropped files to Server
    console.log(files);
    for (var i = 0; i < files.length; i++) {
      readPic(files[i]);
    }
  });

  $("#uploadBtn").on("change", function readFile(event)  {

    console.log(event);
    console.log($(this));

    for (var i = 0; i < this.files.length; i++) {
      readPic(this.files[i]);
    }

  });

});