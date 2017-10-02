# temperature-sensor-server

Requires docker.

To run:

```
# run npm install
docker run \
  --rm \
  -it \
  -v `pwd`/app:/app \
  node:8-alpine \
  sh -c 'cd app && npm install'

# build the docker container
docker build -t temperature .

# run the docker container
docker run \
  -p 8080:8080/tcp \
  -p 8030:8030/udp \
  -v `pwd`/data:/data \
  --rm \
  -it \
  --name temperature \
  temperature
```

By default, listens on port 8030 for UDP temperature packets, and on port 8080 for web requests.

To use, navigate to:
 * http://localhost:8080
 * http://localhost:8080/temperature
 * http://localhost:8080/temperature/graph

You can use code like this to quickly test sending UDP packets (using Node.js):
```
const dgram = require('dgram')

const PORT = 8030
const HOST = '127.0.0.1'

const value = (Math.random() * (26.0 - 24.0) + 24.0).toFixed(1)

const message = new Buffer(value.toString())

const client = dgram.createSocket('udp4')
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err
    console.log('UDP message sent to ' + HOST + ':' + PORT)
    client.close()
});
```
