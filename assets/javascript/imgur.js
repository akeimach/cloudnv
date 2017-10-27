 function gotImage(event) {
  var reader = event.target;
   $("#displayImage").attr("src", reader.result);
   var base64result = reader.result.split(',')[1];
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
     console.log(res.data.link);
   });
 }

 function  readPic(event)  {
   console.log(event);
   console.log($(this));
   var file = this.files[0];
   var reader = new FileReader();
   reader.onloadend = gotImage;
   reader.readAsDataURL(file);

 }

 $(document).ready(function addUpload() {

   var imgur_client_id = "cffdbdcf9cb88c7";
   var imgur_sec = "4e806c50fb260cc521bfe11d4e7edfa22cfbf684";
   var authURL = "https://api.imgur.com/oauth2/authorize?client_id=" + imgur_client_id + "&response_type=token"
   var token = ""

   var form = new FormData();
   form.append("refresh_token", "4c771b1e1055e3eb3adee452a2155ebd258392d1");
   form.append("client_id", "cffdbdcf9cb88c7");
   form.append("client_secret", "4e806c50fb260cc521bfe11d4e7edfa22cfbf684");
   form.append("grant_type", "refresh_token");

   $("#uploadBtn").on("change", readPic);

 });