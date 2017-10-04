FROM node:8-alpine

WORKDIR /app
ADD app/ /app/

EXPOSE 80
EXPOSE 30

CMD node rest-server.js
