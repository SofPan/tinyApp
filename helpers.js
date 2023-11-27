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

const urlsForUserID = (id, database) => {
  const results = {};
  for (const entry in database) {
    if (database[entry].userID === id) {
      results[entry] = database[entry];
    }
  }
  return results;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUserID
};