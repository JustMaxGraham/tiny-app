// jshint esversion: 6

function generateRandomString() {
  let possibleChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = '';

  for (let i = 0; i <= 6; i ++){
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }
  return (randomString);
}

//generateRandomString();

const express = require("express");
const app = express();
const PORT = 8080; //default post 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// When root page is requested, send the page.
app.get('/', function(require, response){
  response.send("Hello!");

});

//When /urls.json  is requested, send the databse in JSON format.
app.get('/urls.json', function(request, response){
  response.json(urlDatabase);
});

//When /hello is requested, send html code of the page.
app.get('/hello', function(request, response){
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

//When /urls is requested, send 'urls-index' page, with data
app.get('/urls', function(request, response){
  let pageVariables = { urls: urlDatabase };
  response.render('urls-index', pageVariables);
});

app.get('/urls/new', function(request, response){
  response.render('urls-new');
});

//When /urls/:id is requested, response with page with individual url pair.
app.get('/urls/:id', function(request, response){
  let templateVars = { shortURL: request.params.id, longURL: urlDatabase[request.params.id] };
  response.render('urls-show', templateVars);
});

app.post('/urls/:id', function(request, response){
  urlDatabase[request.params.id] = request.body.editURL;
  response.redirect('/urls');
});

//Create a new tiny url for given long url.
//Add to database. render new page with the new pair of urls.
app.post('/urls', function(request, response){
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = request.body.longURL;
  //let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL] };
  let pageVariables = { urls: urlDatabase };
  response.render('urls-index', pageVariables);
  //response.render('urls-show', templateVars );

});

app.post('/urls/:tinyUrl/delete', function(request, response){
  delete urlDatabase[request.params.tinyUrl];
  //let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL] };
  //let pageVariables = { urls: urlDatabase };
  //response.render('urls-index', pageVariables);
  //response.render('urls-show', templateVars );
  response.redirect('/urls');

});


app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.listen(PORT, function(){
  console.log(`Example app listening on port ${PORT}`);
});
