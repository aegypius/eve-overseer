FROM node:onbuild
MAINTAINER Nicolas LAURENT <docker@aegypius.com>

EXPOSE 5000
ENV PORT=5000

RUN useradd --home /usr/src/app app && \
    chown -R app.app /usr/src/app

USER app

RUN npm run postinstall
RUN npm run build
