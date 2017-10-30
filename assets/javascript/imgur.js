// Sends image directly to vision api
// Don't use if image is over 4MB
// Also rotates the image if necessary for display
// image is a base64 image URL string
// orientation is a number between 1 and 8 that should be obtained
//  with the getOrientation method.
function sendImageDirect(image, orientation = 1) {
  var base64result = image.replace(/^data:image\/[a-z]+;base64,/, "");
  console.log("Image is less than 4MB")
  queryVisionAPI(base64result);
}

// Sends the image to Imgur to be stored and then Vision.
// Use if image is greater than 4MB.
// Requires a base64Image string with the prepending tags striped out.
function sendImageImgur(image, orientation = 1) {
  var base64result = image.replace(/^data:image\/[a-z]+;base64,/, "");
  console.log("Image is greater than 4MB, wait for Imgur");
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
    console.log(res);
    queryVisionAPI(res.data.link);
    // displayPic(res.data.link);
  });
}

//from http://stackoverflow.com/a/32490603
//Gets the orientation alteration of an image
// based on this picture https://i.stack.imgur.com/VGsAj.gif
//file is a file blob
//call back is the function to perform after completion
// with the paramater of the orientation variable
function getOrientation(file, callback) {
  var reader = new FileReader();

  reader.onload = function(event) {
    var view = new DataView(event.target.result);

    if (view.getUint16(0, false) != 0xFFD8) return callback(-2);

    var length = view.byteLength,
      offset = 2;

    while (offset < length) {
      var marker = view.getUint16(offset, false);
      offset += 2;

      if (marker == 0xFFE1) {
        if (view.getUint32(offset += 2, false) != 0x45786966) {
          return callback(-1);
        }
        var little = view.getUint16(offset += 6, false) == 0x4949;
        offset += view.getUint32(offset + 4, little);
        var tags = view.getUint16(offset, little);
        offset += 2;

        for (var i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) == 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      } else if ((marker & 0xFF00) != 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
};

//from https://stackoverflow.com/a/40867559/8630411
//Resets the orientation of an base64 image url string
// based on the orientation from getOrientaion
// or this image https://i.stack.imgur.com/VGsAj.gif
//srcBase64 is a base64 url string 
//srcOrientation is a number between 2 and 8
//callback is the function to perform after the orientaion has finished 
function resetOrientation(srcBase64, srcOrientation, callback) {
  console.log("Transforming image, please wait");
  var img = new Image();

  img.onload = function() {
    var width = img.width,
      height = img.height,
      canvas = document.createElement('canvas'),
      ctx = canvas.getContext("2d");

    // set proper canvas dimensions before transform & export
    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // transform context before drawing image
    switch (srcOrientation) {
      case 2:
        ctx.transform(-1, 0, 0, 1, width, 0);
        break;
      case 3:
        ctx.transform(-1, 0, 0, -1, width, height);
        break;
      case 4:
        ctx.transform(1, 0, 0, -1, 0, height);
        break;
      case 5:
        ctx.transform(0, 1, 1, 0, 0, 0);
        break;
      case 6:
        ctx.transform(0, 1, -1, 0, height, 0);
        break;
      case 7:
        ctx.transform(0, -1, -1, 0, height, width);
        break;
      case 8:
        ctx.transform(0, -1, 1, 0, 0, width);
        break;
      default:
        break;
    }

    // draw image
    ctx.drawImage(img, 0, 0);

    // export base64
    callback(canvas.toDataURL());
  };

  img.src = srcBase64;
}

//Displays picture on the page
//picture is a valid string for that an image src tag can use
function displayPic(picture) {
  $("#displayImage").attr("src", picture);
  $("#displayImage").removeClass("hidden");
  $("#drag").removeClass("uploadWanted");
  $("#cloudDesc").empty(); 
}

function orientDisplayPic(picture, orientation) {
  if (orientation > 1) {
    resetOrientation(picture, orientation, function rotate(rotated) {
      displayPic(rotated);
    });
  } else {
    displayPic(picture);
  }
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
          displayPic(base64data);
          if (file.size < 4000000) {
            sendImageDirect(base64data);
          } else {
            sendImageImgur(base64data);
          }
        }, {
          //should be set to canvas : true to activate auto fix orientation
          canvas: true,
          orientation: orientation
        }
      );
    });
    // getOrientation(file, function checkRotate(orientation) {
    //   console.log(orientation);
    //   var reader = new FileReader();
    //   getImageBase64(file, function(image) {
    //     if (file.size < 4000000) {
    //        orientDisplayPic(image, orientation);
    //       sendImageDirect(image, orientation);
    //     } else {  
    //        orientDisplayPic(image, orientation);
    //       sendImageImgur(image, orientation);
    //     }
    //   });
    // });
  }
}


//Takes a file blob and returns a base64dataURL
function getImageBase64(file, callback) {
  var reader = new FileReader();
  reader.onload = function gotImage(event) {
    var image = event.target.result;
    callback(image)
  };
  reader.readAsDataURL(file);
}

//Checks if a string is a base65URL
//returns boolean
function isBase64image(base64string) {
  var legal = base64string[base64string.length - 1] === "=";
  console.log(legal);
  var base64reg = new RegExp(/data:image\/([a-zA-Z]*);base64,([^\"]*)/);
  var valid = base64reg.test(base64string);
  console.log(valid);
  var image = base64string.search(/data:image/) !== -1;
  console.log(image);
  return (legal && valid && image);
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

  $("#drag").on('dragover', function(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('dragover');
    $(this).css('border', '2px solid #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.6)');
    $(this).css('color', '#173848');
  });
  $("#drag").on('dragleave', function(event) {
    event.stopPropagation();
    event.preventDefault();
    console.log('dragleave');
    $(this).css('border', '2px dotted #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.4)');
    $(this).css('color', '#31708f');
  });
  $("#drag").on('drop', function(event) {
    event.stopPropagation();
    event.preventDefault();

    $(this).css('border', '2px dotted #66aede');
    $(this).css('background-color', 'rgba(255,255,255,0.4)');
    $(this).css('color', '#31708f');
    var files = event.originalEvent.dataTransfer.files;
    console.log(files.length === 0);
    if (files.length !== 0) {
      //We need to send dropped files to Server
      console.log(files);
      for (var i = 0; i < files.length; i++) {
        readPic(files[i]);
      }
    } else {
      var url = $(event.originalEvent.dataTransfer.getData('text/html')).filter('img').attr('src');
      console.log(url);
      if (isURL(url)) {
        console.log("Upload from another site");
        displayPic(url);
        queryVisionAPI(url);
      }
      if (isBase64image(url)) {
        console.log("Upload from another site");
        displayPic(url);
        queryVisionAPI(url);
      }
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