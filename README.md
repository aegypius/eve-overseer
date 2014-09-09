eve-overseer
============
[![wercker status](https://app.wercker.com/status/58cfa027e6e90ef5170148c3d0b3d700/s "wercker status")](https://app.wercker.com/project/bykey/58cfa027e6e90ef5170148c3d0b3d700)

This project aims to replace software like EVEMon in a browser.

### Requirements

  - nodejs: 0.10.x
  - npm
  - MongoDB

### Environments variables

This project use dotenv you can ever export your environments vars from your shell
or use a ```.env```. (Remember to **never** commit you ```.env``` file)

- ```PORT```: allows you to tell the server to listen on the given port (default: 3333)
- ```NODE_ENV```: tell node to use one of these runtime environment:
  - ```development``` - This is the default environment
  - ```test```        - Used to run test suites
  - ```production```  - Environment for production (live)
- ```COOKIE_SECRET```:  secret phrase used for cookies
- ```SESSION_SECRET```: secret phrase used for sessions

### Hacking

#### Clone and Running

From your terminal:

    git clone https://github.com/aegypius/eve-overseer
    cd eve-overseer
    npm install
    npm run brunch

You can also use ```npm start``` to start server with a production build of brunch.

#### Hacking with docker

If you intend to use docker to manage the mongodb database, you can run

    sudo npm install -g decking
    decking create dev
    decking start dev

This will create a development cluster with a persistent storage located in _.cache_
directory, start mongodb cluster (first time can take a few minutes) and genghisapp
container. You can access genghisapp web-ui at [http://localhost:3344](http://localhost:3344)

You still need to launch server with ```npm run brunch```

#### Running tests

To run test suite simply run :

```NODE_ENV=test npm test```
