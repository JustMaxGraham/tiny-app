// jshint esversion: 6

/**************************
Functions
**************************/

function generateRandomString() {
  let possibleChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = '';

  for (let i = 0; i <= 6; i ++){
    randomString += possibleChars[Math.floor(Math.random() * possibleChars.length)];
  }
  return (randomString);
}

function urlsForUser(id){
  let filteredDB = {};
  for (let tinyURL in urlDatabase) {
    if(urlDatabase[tinyURL].userID === id) {
      filteredDB[tinyURL] = urlDatabase[tinyURL];
    }
  }
  return filteredDB;
};

/**************************
Declarations and 'Databases'
**************************/
const express = require("express");
const app = express();
const PORT = 8080; //default post 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const validURL = require('valid-url');
const methodOverride = require('method-override');

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');

app.listen(PORT, function(){
  console.log(`Listening on port ${PORT}`);
});

let urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "123",
    dateCreated: "Fri Jan 18 2019 21:19:12 GMT+0000 (UTC)",
    visits: 12,
    uniqueVisits: {}
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "456",
    dateCreated: "Fri Jan 18 2019 21:19:12 GMT+0000 (UTC)",
    visits: 99,
    uniqueVisits: {}
  }
};

let usersDB = {

  "123": {
    id: "123",
    email: "user1@example.com",
    hashedPassword: "$2b$10$kvqtPioPSopGPMiLQeDoL.KWgEFPOhdsLNFGg529iX0Dp9meZSX2y"
  },

  "456": {
    id: "456",
    email: "user2@example.com",
    hashedPassword: "$2b$10$7HcAva1n9RAGUYUfJduWzeiJVjSX2QCyhAVXP4mWE/Y1KtI08aJQq"
  }
};


/**************************
Get Requests
**************************/

app.get('/', (request, response) => {

  if(request.session.user_id !== undefined){
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  };

});

app.get('/urls', (request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/login');
    return;
  };

  let pageVariables = {
    urls: urlsForUser(request.session.user_id),
    user: usersDB[request.session.user_id]
  };

  response.render('urls-index', pageVariables);

});

app.get('/urls/new',(request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/login');
    return;
  };

  let pageVariables = {
    user: usersDB[request.session.user_id]
  };

  response.render('urls-new', pageVariables);

});

app.get('/urls/:id', (request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/login');
    return;
  };

  if (!urlDatabase[request.params.id]){
    response.status(404).send("This TinyURL does not exist. Check that you entered it correctly.");
    return;
  };

  if (urlDatabase[request.params.id].userID !== request.session.user_id){
   response.status(404).send("You do not have access to this TinyURL.");
   return;
  };


  let pageVariables = {
    TinyURL: request.params.id,
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-show', pageVariables);

});

app.get('/login', (request, response) => {

  if (request.session.user_id !== undefined){
    response.redirect('/urls');
    return;
  };


  let pageVariables = {
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-login', pageVariables);

});

app.get("/u/:tinyURL", (request, response) => {

  if (!urlDatabase[request.params.tinyURL]){
    response.status(404).send("Not a valid TinyURL. Please check that you entered it correctly. test test");
    return;
  };

  urlDatabase[request.params.tinyURL].visits ++;

  let visitorID = generateRandomString();

  request.session.visitor_id = visitorID;

  urlDatabase[request.params.tinyURL].uniqueVisits[visitorID] = Date();

  let longURL = urlDatabase[request.params.tinyURL].longURL;

  if (validURL.isWebUri(longURL)){
    response.redirect(longURL);
    return;
  } else {
    response.redirect('http://' + longURL);
    return;
  };

});

app.get('/register', (request, response) => {

  if (request.session.user_id !== undefined){
    response.redirect('/urls');
    return;
  };


  let pageVariables = {
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-register', pageVariables);

});


/**************************
Post Requests (PUT and DELETE)
**************************/

app.put('/urls', (request, response) => {

  if (request.session.user_id === undefined){
    response.status(404).send("Must be logged in to access.");
    return;
  };

  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: "",
    userID: "",
    dateCreated: "",
    visits: 0,
    uniqueVisits: {}
  };

  urlDatabase[newShortURL].longURL = request.body.longURL;
  urlDatabase[newShortURL].userID = request.session.user_id;
  urlDatabase[newShortURL].dateCreated = Date();

  let pageVariables = {
    urls: urlsForUser(request.session.user_id),
    user: usersDB[request.session.user_id]
    };

  response.redirect('/urls');

});

app.put('/urls/:id', (request, response) => {

  if (request.session.user_id === undefined){
    response.status(404).send("Must be logged in to access.");
    return;
  };

  if (urlDatabase[request.params.id].userID !== request.session.user_id){
   response.status(404).send("You do not have access to this TinyURL.");
   return;
  };

  urlDatabase[request.params.id].longURL = request.body.editURL;
  response.redirect('/urls');

});

app.delete('/urls/:tinyURL/delete', (request, response) => {

  if (request.session.user_id === undefined){
    response.status(404).send("Must be logged in to access.");
    return;
  };

  if (urlDatabase[request.params.tinyURL].userID !== request.session.user_id){
   response.status(404).send("You do not have access to this TinyURL.");
   return;
  };

  delete urlDatabase[request.params.tinyURL];
  response.redirect('/urls');

});

app.put('/login', (request, response) => {

  for (let user in usersDB){
    if (usersDB[user].email === request.body.email){
      if (bcrypt.compareSync(request.body.password, usersDB[user].hashedPassword)){
        request.session.user_id = usersDB[user].id;
        response.redirect('/urls');
        return;
      } else {
        response.status(404).send("Wrong Password");
        return;
      };
    };
  };

  response.status(404).send("Email not found.");

});

app.put('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});


app.put('/register', (request, response) => {

  let newUserID = generateRandomString();
  let newUserEmail = request.body.email;
  let hashedPassword = bcrypt.hashSync(request.body.password, 10);

  if (newUserID === '' || newUserEmail === '') {
    response.status(404).send("Fields blank.");
    return;
  }

  for (let user in usersDB){
    if (usersDB[user].email === newUserEmail){
      response.status(404).send("Email already registered");
      return;
    };
  };

  usersDB[newUserID] = { id: '' , email: '', hashedPassword: ''};
  usersDB[newUserID].id = newUserID;
  usersDB[newUserID].email = newUserEmail;
  usersDB[newUserID].hashedPassword = hashedPassword;

  request.session.user_id = newUserID;
  response.redirect('/urls');

});

