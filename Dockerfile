FROM node:8-alpine

WORKDIR /app
ADD app/ /app/

CMD node rest-server.js
