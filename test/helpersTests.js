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

const testURLs = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
};

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

describe("#urlsForUserID", () => {
  it("should return an object containing only the user's URLs", () => {
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
      },
    };
    const actual = urlsForUserID("userRandomID", testURLs);
    assert.deepStrictEqual(actual, expected);
  });
  it("should return an empty object when no URLs match user ID", () => {
    const noURLsMatch = urlsForUserID("notAndID", testURLs);
    assert.deepStrictEqual(noURLsMatch, {});
  });
});

describe("#generateRandomString", () => {
  it("should return 6 characters", () => {
    const randomString = generateRandomString();
    assert.strictEqual(randomString.length, 6);
  });
  it("should be a string", () => {
    const randomString = generateRandomString();
    assert.strictEqual(typeof randomString === "string", true);
  });
});