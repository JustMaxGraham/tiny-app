// jshint esversion: 6

const express = require("express");
const app = express();
const PORT = 8080; //default post 8080

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

app.listen(PORT, function(){
  console.log(`Example app listening on port ${PORT}`);
});