var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var path = require('path');
var casual = require('casual');

before(function () {
  return helpers.run(path.join(__dirname, '../generators/app'))
    .withOptions({foo: 'bar'})      // Mock options passed in
    .withArguments(['name-x'])      // Mock the arguments
    .withPrompts({
      email: casual.email,
      license: 'MIT'
    })                              // Mock the prompt answers
    .toPromise();                   // Get a Promise back for when the generator finishes
});

describe('googly-microservice:app', function () {
  it('generate a basic microservice', done => {
    assert.file([
      'package.json',
      'src/index.js',
      'src/service.js',
      'test/service.js',
      'index.js'
    ]);
    done();
  });
  it('generate a license', done => {
    assert.file(['LICENSE']);
    done();
  });
  it('generate docker files', done => {
    assert.file([
      '.dockerignore',
      'Dockerfile'
    ]);
    done();
  });
});
