const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { generateRandomString, getUserByEmail, urlsForUserID } = require('./helpers');

app.set("view engine", "ejs");

const passTest = "HelloWorld!";
const hashTest = bcrypt.hashSync(passTest, 10);

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "quickUser"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "quickUser"
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  quickUser: {
    id: "quickUser",
    email: "quick@email.com",
    password: hashTest,
  }
};

/* ----- MIDDLEWARE ----- */
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["some-key"],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

/* ----- GET REQUESTS ----- */
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userCookie = req.session.userID;
  const templateVars = {
    user: users[userCookie],
    urls: urlsForUserID(userCookie, urlDatabase),
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userCookie = req.session.userID;

  const templateVars = {
    user: users[userCookie],
  };

  if (!userCookie) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userCookie = req.session.userID;
  const currentID = req.params.id;
  const userURLs = urlsForUserID(userCookie, urlDatabase);

  const templateVars = {
    id: currentID,
    longURL: null,
    user: users[userCookie],
    belongsToUser: true
  };
  if (urlDatabase[currentID]) {
    templateVars.longURL = urlDatabase[currentID].longURL;
  }
  if (!userURLs[currentID]) {
    templateVars.belongsToUser = false;
    res.redirect(`/error/${currentID}`);
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // if the id does not exist, redirect to page not found, otherwise the longURL is associated with the id
  const longURL = req.params.id === 'undefined' ?
    res.status(404).end("404 Page Not Found")
    : urlDatabase[req.params.id].longURL;

  res.redirect(longURL);
});

app.get("/error/:id", (req, res) => {
  const userCookie = req.session.userID;
  const currentID = req.params.id;
  const userURLs = urlsForUserID(userCookie, urlDatabase);
  const templateVars = {
    user: users[userCookie],
    idExists: true,
    belongsToUser: true
  };
  if (!urlDatabase[currentID]) {
    templateVars.idExists = false;
  }
  if (!userURLs[currentID]) {
    templateVars.belongsToUser = false;
  }
  res.render("error", templateVars);
});

/* ----- POST REQUESTS ----- */
app.post("/urls", (req, res) => {
  const userCookie = req.session.userID;
  if (userCookie) {
    const createId = generateRandomString();
    urlDatabase[createId] = {
      longURL: req.body.longURL,
      userID: userCookie,
    };
    res.redirect(`/urls/${createId}`);
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userCookie = req.session.userID;
  const userURLs = urlsForUserID(userCookie, urlDatabase);
  const idToDelete = req.params.id;
  if (userURLs[idToDelete]) {
    delete urlDatabase[idToDelete];
    res.redirect('/urls');
  }
  res.redirect(`/error/${idToDelete}`);
});

app.post("/urls/:id/update", (req, res) => {
  const userCookie = req.session.userID;
  const userURLs = urlsForUserID(userCookie, urlDatabase);
  const idToUpdate = req.params.id;
  if (userURLs[idToUpdate]) {
    const editedLongURL = req.body.longURL;
    urlDatabase[idToUpdate].longURL = editedLongURL;
    res.redirect(`/urls/${idToUpdate}`);
  }

  res.redirect(`/error/${idToUpdate}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // will return a user object or false if not registered
  const currentUser = getUserByEmail(email, users);
  if (!currentUser) {
    return res.status(403).end("Email not found");
  }

  const passwordCheck = bcrypt.compareSync(password, currentUser.password);

  if (!passwordCheck) {
    return res.status(403).end("Invalid Password");
  }

  req.session.userID = currentUser.id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // will return a user object if email is already registered
  const checkRegistered = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).end("Must fill out email and password fields");
  } else if (checkRegistered) {
    return res.status(400).end("Email already in use");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: hashedPassword,
    };
    req.session.userID = newUserID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});