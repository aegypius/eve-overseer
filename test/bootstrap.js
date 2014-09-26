(require('dotenv')).load();

global.chai      = require("chai");
global.should    = chai.should();
global.expect    = chai.expect;
global.assert    = require("assert");
global.supertest = require("supertest");
global.mongoose  = mongoose = require("mongoose");
global.casual    = casual = require("casual");
global.debug     = debug = require("debug")('test');
global.port      = process.env.PORT || 3333;

mongoose.connection.on("error", function (err) {
  debug("error ignored from mongoose : ", err);
});


global.user      = {
  email:    casual.email,
  username: casual.username,
  password: "password",
};
global.apiKey = {
  keyId:            process.env.TEST_EVEONLINE_API_ID,
  verificationCode: process.env.TEST_EVEONLINE_VERIFICATION_CODE,
};
