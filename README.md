eve-overseer
============

This project aims to replace software like EVEMon in a browser.

### Requirements

  - nodejs: 0.10.x
  - npm
  - MongoDB


### Configuration

During development you can use an apikey and validation code from environment.

Create a file named ".env" and replace values with your own api key

    EVE_API_KEY_ID=123456789
    EVE_API_VERIFICATION_CODE=nyanyanyanyanyanyanyanyan

You must **never** commit your .env file

### Hacking

From your terminal:

    git clone https://github.com/aegypius/eve-overseer
    cd eve-overseer
    npm install
    npm run brunch


#### Hacking with docker

If you intend to use docker to manage the mongodb database, you can run

    sudo npm install -g decking
    decking create dev
    decking start dev

This will create a development cluster with a persistent storage located in _.cache_
directory, start mongodb cluster (first time can take a few minutes) and genghisapp
container. You can access genghisapp web-ui at http://localhost:3344

You still need to launch server with ```npm run brunch```
