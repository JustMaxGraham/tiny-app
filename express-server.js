// jshint esversion: 6

function generateRandomString() {
  let possibleChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = '';

  for (let i = 0; i <= 6; i ++){
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }
  return (randomString);
}

generateRandomString();

const express = require("express");
const app = express();
const PORT = 8080; //default post 8080

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', function(require, response){
  response.send("Hello!");

});

app.get('/urls.json', function(request, response){
  response.json(urlDatabase);
});

app.get('/hello', function(request, response){
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', function(request, response){
  let pageVariables = { urls: urlDatabase };
  response.render('urls-index', pageVariables);
});

app.get('/urls/new', function(request, response){
  response.render('urls-new');
});

app.get('/urls/:id', function(request, response){
  let templateVars = { shortURL: request.params.id, longURL: urlDatabase[request.params.id] };
  response.render('urls-show', templateVars);
});

app.post('/urls', function(request, response){
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = request.body.longURL;
  console.log(request.body.longURL);
  console.log(urlDatabase);
  response.send('Ok');
});

app.listen(PORT, function(){
  console.log(`Example app listening on port ${PORT}`);
});

// var uid = function() {
//   return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
// };

// // adds a track to the library

// var addTrack = function (name, artist, album) {

//   var newTrackID = uid();
//   library.tracks[newTrackID] = {};
//   library.tracks[newTrackID].id = newTrackID;
//   library.tracks[newTrackID].name = name ;
//   library.tracks[newTrackID].artist = artist;
//   library.tracks[newTrackID].album = album;

// };