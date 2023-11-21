const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const generateRandomString = () => {
  /*
    - toString(36) converts the random number to base 36 (character associated with digit)
    - take substring from index 2 to remove the 0. from randomly generated number
    - substring 2, 8 returns 6 characters
  */
  const randomChars = Math.random().toString(36).substring(2, 8);
  return randomChars;
};

generateRandomString();


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

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

app.post("/urls", (req, res) => {
  console.log(req.body); // Log POST request to the console
  res.send("Ok"); // Respond with "Ok"
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});