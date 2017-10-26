var imgur_id = "cffdbdcf9cb88c7";
var imgur_sec = "4e806c50fb260cc521bfe11d4e7edfa22cfbf684";

authURL = "https://api.imgur.com/oauth2/authorize?client_id="+imgur_id+"&response_type=token"

// $.ajax({
//   "url": authURL,
//   "method": "GET"
// }).done(function (response){
//   console.log(response);
// });

var token = ""

var form = new FormData();
form.append("refresh_token", "4c771b1e1055e3eb3adee452a2155ebd258392d1");
form.append("client_id", "cffdbdcf9cb88c7");
form.append("client_secret", "4e806c50fb260cc521bfe11d4e7edfa22cfbf684");
form.append("grant_type", "refresh_token");

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.imgur.com/oauth2/token",
  "method": "POST",
  "headers": {},
  "processData": false,
  "contentType": false,
  "mimeType": "multipart/form-data",
  "data": form
}



$.ajax(settings).done(function (response) {
  var res = JSON.parse(response);
  console.log(JSON.parse(response));
  token = res.access_token;
  console.log(token);

  var accountGet = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.imgur.com/3/account/voidreturner",
  "method": "GET",
  "headers": {"authorization": `Bearer ${token}`},
}
console.log(accountGet.headers);
  $.ajax(accountGet).done(function (response){
    console.log(response);
  })
$.ajax( {
  "url": "https://api.imgur.com/3/account/me/images",
  "meathod": "GET",
  "headers": {"authorization": `Bearer ${token}`}
}).done (function (response) {
  console.log(response);
});
});

$.ajax( {
  "async": true,
  "crossDomain": true,
  "url": "https://api.imgur.com/3/account/images",
  "meathod": "GET",
  "headers": {"authorization": `Client-ID ${imgur_id}`}
}).done (function (response) {
  console.log("Client-ID:");
  console.log(response);
});