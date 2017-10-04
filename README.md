# temperature-sensor-server

Designed to collect data from this arduino-based sensor: [https://github.com/baprozeniuk/ESP8266TempLogger](https://github.com/baprozeniuk/ESP8266TempLogger)

Requires [Docker](https://www.docker.com/get-docker).

To build from source (optional):

```
# run npm install
docker run --rm -it -v `pwd`/app:/app node:8-alpine sh -c 'cd app && npm install'

# build the docker container
docker build -t andrewmacheret/temperature-sensor-server .
```

To run:

```
# run the docker container
docker run -p 8080:80/tcp -p 8030:30/udp -v `pwd`/data:/data --rm -it --name temperature-sensor-server andrewmacheret/temperature-sensor-server
```

By default, listens on port 8030 for UDP temperature packets, and on port 8080 for web requests.

To use, navigate to:
 * http://localhost:8080
 * http://localhost:8080/temperature
 * http://localhost:8080/temperature/graph

You can run the following quickly send test UDP packets:
```
docker exec temperature-sensor-server node /app/send-test-packet.js
```
