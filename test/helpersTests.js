const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUserID } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// it("", () => { });
describe("#getUserByEmail", () => {
  it("should return a user with a valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepStrictEqual(user, testUsers[expectedUserID]);
  });
  it("should return undefined when a user is not in our database", () => {
    const invalidUser = getUserByEmail("notfound@example.com", testUsers);
    assert.strictEqual(invalidUser, undefined);
  });
});