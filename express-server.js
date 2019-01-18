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

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let urlDatabase = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "123"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "456"
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
Get Methods
**************************/

// When root page is requested, send the page.
app.get('/', (request, response) => {

  if(request.session.user_id !== undefined){
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }

});

//When /urls.json  is requested, send the databse in JSON format.
app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

//When /hello is requested, send html code of the page.
app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

//When /urls is requested, send 'urls-index' page, with data
app.get('/urls', (request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/login');
    return;
  }

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
  }

  let pageVariables = {
    user: usersDB[request.session.user_id]
  };

  response.render('urls-new', pageVariables);

});

//When /urls/:id is requested, response with page with individual url pair.
app.get('/urls/:id', (request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/login');
    return;
  }

  let pageVariables = {
    TinyURL: request.params.id,
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-show', pageVariables);

});

app.get('/login', (request, response) => {

  let pageVariables = {
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-login', pageVariables);

});

app.get("/u/:shortURL", (request, response) => {

  if (request.session.user_id === undefined){
    response.redirect('/register');
    return;
  }

  let longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);

});

app.get('/register', (request, response) => {

  let pageVariables = {
    urls: urlDatabase,
    user: usersDB[request.session.user_id]
    };

  response.render('urls-register', pageVariables);

});


/**************************
Post Methods
**************************/

app.post('/urls/:id', (request, response) => {
  urlDatabase[request.params.id].longURL = request.body.editURL;
  response.redirect('/urls');
});

//Create a new tiny url for given long url.
//Add to database. render new page with the new pair of urls.
app.post('/urls', (request, response) => {

  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: "",
    userID: ""
  };

  urlDatabase[newShortURL].longURL = request.body.longURL;
  urlDatabase[newShortURL].userID = request.session.user_id;

  //console.log(urlsForUser(cookies.user_id));
  let pageVariables = {
    //urls: urlDatabase,
    urls: urlsForUser(request.session.user_id),
    user: usersDB[request.session.user_id]
    };

  response.redirect('/urls');

});

app.post('/urls/:tinyUrl/delete', (request, response) => {
  delete urlDatabase[request.params.tinyUrl];
  response.redirect('/urls');
});

app.post('/login', (request, response) => {

  for (let user in usersDB){
    if (usersDB[user].email === request.body.email){
      if (bcrypt.compareSync(request.body.password, usersDB[user].hashedPassword)){
        request.session.user_id = usersDB[user].id;
        response.redirect('/urls');
        return;
      } else {
        response.status(403).send("Wrong Password");
        return;
      }
    }
  }

    response.status(403).send("Email not found.");
    //response.redirect('/register');

});

app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/login');
});


app.post('/register', (request, response) => {

  let newUserID = generateRandomString();
  let newUserEmail = request.body.email;
  let hashedPassword = bcrypt.hashSync(request.body.password, 10);

  if (newUserID === '' || newUserEmail === '') {
    response.status(400).send("Fields blank.");
    return;
  }

  for (let user in usersDB){
    if (usersDB[user].email === newUserEmail){
      response.status(400).send("Email already registered");
      return;
    }
  }

  usersDB[newUserID] = { id: '' , email: '', hashedPassword: ''};
  usersDB[newUserID].id = newUserID;
  usersDB[newUserID].email = newUserEmail;
  usersDB[newUserID].hashedPassword = hashedPassword;
  console.log(usersDB);

  request.session.user_id = newUserID;
  response.redirect('/urls');

});

/**************************
Listen Methods
**************************/


app.listen(PORT, function(){
  console.log(`Example app listening on port ${PORT}`);
});

