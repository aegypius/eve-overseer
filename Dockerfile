FROM node:onbuild
MAINTAINER Nicolas LAURENT <docker@aegypius.com>

RUN adduser --home /usr/src/app --disabled-password app && \
    chown -R app.app /usr/src/app

USER app

RUN npm run postinstall
RUN npm run build
