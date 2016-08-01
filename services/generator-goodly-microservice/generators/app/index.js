'use strict';
var yeoman = require('yeoman-generator');
// var chalk = require('chalk');
// var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');
var githubUsername = require('github-username');
var askName = require('inquirer-npm-name');
var parseAuthor = require('parse-author');

module.exports = yeoman.Base.extend({

  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage,
      license: 'MIT',
      babel: Boolean(this.options.babel)
    };

    if (_.isObject(this.pkg.author)) {
      this.props.authorName = this.pkg.author.name;
      this.props.authorEmail = this.pkg.author.email;
      this.props.authorUrl = this.pkg.author.url;
    } else if (_.isString(this.pkg.author)) {
      var info = parseAuthor(this.pkg.author);
      this.props.authorName = info.name;
      this.props.authorEmail = info.email;
      this.props.authorUrl = info.url;
    }
  },

  prompting: {
    askForServiceName: function () {
      if (this.pkg.name || this.options.name) {
        this.props.name = this.pkg.name || _.kebabCase(this.options.name);
        return;
      }

      return askName({
        name: 'name',
        message: 'Microservice Name',
        default: path.basename(process.cwd()),
        filter: _.kebabCase,
        validate: function (str) {
          return str.length > 0;
        }
      }, this).then(function (answer) {
        this.props.name = answer.name;
      }.bind(this));
    },

    askFor: function () {
      var prompts = [{
        name: 'description',
        message: 'Description',
        when: !this.props.description
      }, {
        name: 'homepage',
        message: 'Project homepage url',
        when: !this.props.homepage
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        when: !this.props.authorName,
        default: this.user.git.name(),
        store: true
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        when: !this.props.authorEmail,
        default: this.user.git.email(),
        store: true
      }, {
        name: 'authorUrl',
        message: 'Author\'s Homepage',
        when: !this.props.authorUrl,
        store: true
      }, {
        name: 'keywords',
        message: 'Package keywords (comma to split)',
        when: !this.pkg.keywords,
        filter: function (words) {
          return words.split(/\s*,\s*/g);
        }
      }];

      return this.prompt(prompts).then(function (props) {
        this.props = Object.assign(this.props, props);
      }.bind(this));
    },

    askForGithubAccount: function () {
      if (this.options.githubAccount) {
        this.props.githubAccount = this.options.githubAccount;
        return;
      }
      var done = this.async();

      githubUsername(this.props.authorEmail, function (err, username) {
        if (err) {
          username = username || '';
        }
        this.prompt({
          name: 'githubAccount',
          message: 'GitHub username or organization',
          default: username
        }).then(function (prompt) {
          this.props.githubAccount = prompt.githubAccount;
          done();
        }.bind(this));
      }.bind(this));
    }
  },

  writing: function () {
    // Re-read the content at this point because a composed generator might modify it.
    var templatePkg = this.fs.readJSON(this.templatePath('package.json'), {});
    var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    var pkg = Object.assign(templatePkg, currentPkg, {
      name: _.kebabCase(this.props.name),
      version: '0.0.0',
      description: this.props.description,
      homepage: this.props.homepage,
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail,
        url: this.props.authorUrl
      },
      files: [
        'lib'
      ],
      main: 'lib/index.js',
      keywords: []
    });

    // Combine the keywords
    if (this.props.keywords) {
      pkg.keywords = _.uniq(this.props.keywords.concat(pkg.keywords));
    }

    // Let's extend package.json so we're not overwriting user previous fields
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    this.fs.copyTpl(this.templatePath('Dockerfile'), this.destinationPath('Dockerfile'), this.props);
    this.fs.copyTpl(this.templatePath('.babelrc'), this.destinationPath('.babelrc'), this.props);
    this.fs.copyTpl(this.templatePath('.dockerignore'), this.destinationPath('.dockerignore'), this.props);
    this.fs.copyTpl(this.templatePath('.gitignore'), this.destinationPath('.gitignore'), this.props);
    this.fs.copyTpl(this.templatePath('index.js'), this.destinationPath('index.js'), this.props);
    this.fs.copyTpl(this.templatePath('src/index.js'), this.destinationPath('src/index.js'), this.props);
    this.fs.copyTpl(this.templatePath('src/service.js'), this.destinationPath('src/service.js'), this.props);
    this.fs.copyTpl(this.templatePath('test/service.js'), this.destinationPath('test/service.js'), this.props);
  },

  install: function () {
    this.npmInstall();
  },

  default: function () {
    if (this.props.license && !this.pkg.license) {
      this.composeWith('license', {
        options: {
          name: this.props.authorName,
          email: this.props.authorEmail,
          website: this.props.authorUrl
        }
      }, {
        local: require.resolve('generator-license/app')
      });
    }
  }
});
