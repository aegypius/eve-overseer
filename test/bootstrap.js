global.chai      = require("chai");
global.should    = chai.should();
global.expect    = chai.expect;
global.assert    = require("assert");
global.supertest = require("supertest");
global.faker     = faker = require("faker");
global.user      = {
  email:    faker.Internet.email(),
  username: faker.Internet.userName(),
  password: "password",
};

/**
 * Mock EVE API
 */
var nock        = require("nock"),
    eveapi      = nock("https://api.eveonline.com");
