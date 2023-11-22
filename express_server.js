const express = require('express');
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

// GET REQUESTS
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // if the id does not exist, redirect to page not found, otherwise the longURL is associated with the id
  const longURL = req.params.id === 'undefined' ? "/404"
    : urlDatabase[req.params.id];

  res.redirect(longURL);
});

// POST REQUESTS
app.post("/urls", (req, res) => {
  const createId = generateRandomString();
  urlDatabase[createId] = req.body.longURL;
  res.redirect(`/urls/${createId}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const idToUpdate = req.params.id;
  const editedLongURL = req.body.longURL;
  urlDatabase[idToUpdate] = editedLongURL;
  res.redirect(`/urls/${idToUpdate}`);
});