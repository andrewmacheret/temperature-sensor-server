const dgram = require('dgram')
const fs = require('fs');

const maxQueueSize = 5
const queue = []

const PORT = 8030
const HOST = '0.0.0.0'
const server = dgram.createSocket('udp4')

const logStream = fs.createWriteStream(__dirname + '/../data/temperature.log', {'flags': 'a'});

server.on('listening', function () {
  const address = server.address()
  console.log(`UDP Server listening on ${address.address}:${address.port}`)
})

server.on('message', function (messageBuffer, remote) {
  const date = Date.now()
  const message = messageBuffer.toString()
  const temperature = parseFloat(messageBuffer.toString())

  const output = `${date},${temperature}`
  console.log(output)
  logStream.write(output + '\n');

  if (queue.length >= maxQueueSize) queue.shift()
  queue.push([date, temperature])
})

server.bind(PORT, HOST)

module.exports = queue
