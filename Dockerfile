FROM node:onbuild
MAINTAINER Nicolas LAURENT <docker@aegypius.com>

EXPOSE 5000
ENV PORT=5000

RUN useradd --home /usr/src/app app && \
    chown -R app.app /usr/src/app

RUN npm install -g bower mocha

USER app

RUN npm run build
