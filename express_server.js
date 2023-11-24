const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const generateRandomString = () => {
  /*
    - toString(36) converts the random number to base 36 (character associated with digit)
    - take substring from index 2 to remove the "0." from randomly generated number
    - substring(2, 8) returns 6 characters
  */
  const randomChars = Math.random().toString(36).substring(2, 8);
  return randomChars;
};

const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    password: "123abc123",
  }
};

/* ----- MIDDLEWARE ----- */
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

/* ----- GET REQUESTS ----- */
app.get("/", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userCookie = req.cookies["user_id"];

  const templateVars = {
    user: users[userCookie],
  };

  if (!userCookie) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // if the id does not exist, redirect to page not found, otherwise the longURL is associated with the id
  const longURL = req.params.id === 'undefined' ? "/404"
    : urlDatabase[req.params.id];

  res.redirect(longURL);
});

/* ----- POST REQUESTS ----- */
app.post("/urls", (req, res) => {
  const userCookie = req.cookies["user_id"];
  if (userCookie) {
    const createId = generateRandomString();
    urlDatabase[createId] = req.body.longURL;
    res.redirect(`/urls/${createId}`);
  }
  res.send("<h3>You must be logged in to create new urls</h3>");
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const idToUpdate = req.params.id;
  const editedLongURL = req.body.longURL;
  urlDatabase[idToUpdate] = editedLongURL;
  res.redirect(`/urls/${idToUpdate}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // will return a user object or false if not registered
  const currentUser = getUserByEmail(email, users);
  if (!currentUser) {
    return res.status(403).end("Email not found");
  }

  if (password !== currentUser.password) {
    return res.status(403).end("Invalid Password");
  }

  res.cookie("user_id", currentUser.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // will return a user object if email is already registered
  const checkRegistered = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).end("Must fill out email and password fields");
  } else if (checkRegistered) {
    return res.status(400).end("Email already in use");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
    };

    res.cookie("user_id", newUserID);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});