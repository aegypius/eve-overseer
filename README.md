eve-overseer
============

This project aims to replace software like EVEMon in a browser.

### Requirements

  - nodejs: 0.10.x
  - npm

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
