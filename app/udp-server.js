const dgram = require('dgram')
const fs = require('fs');
const binstruct = require('binstruct')

// define the binary structure we expect
const binary = binstruct.def({littleEndian: false})
  .byte('mac0')
  .byte('mac1')
  .byte('mac2')
  .byte('mac3')
  .byte('mac4')
  .byte('mac5')
  .byte('id0')
  .byte('id1')
  .float('temperature')

// function to convert a byte to a hex string
const byteToHex = (b) => {
  const h = (+b).toString(16);
  return h.length < 2 ? '0' + h : h
}

// define queues of the last 100 readings
const maxQueueSize = 100
const queues = new Map()

// choose a port and host to listen to
const PORT = 30
const HOST = '0.0.0.0'

// set up a log stream for all data heard
const dataPath = __dirname + '/../data'
const logStream = fs.createWriteStream(dataPath + '/temperature.log', {'flags': 'a'})

// set up the udp server
const server = dgram.createSocket('udp4')

// on udp server startup, log it
server.on('listening', function () {
  const address = server.address()
  console.log(`UDP Server listening on ${address.address}:${address.port}`)
})

// on a udp server message, handle it
server.on('message', function (messageBuffer, remote) {
  const date = Date.now()

  const message = binary.read(messageBuffer)
  const temperature = message.temperature
  const id = [message.id0, message.id1].map(byteToHex).join(':')
  const mac = [message.mac0, message.mac1, message.mac2, message.mac3, message.mac4, message.mac5].map(byteToHex).join(':')

  const key = `${id}@${mac}`
  const data = [date, temperature]

  // log the incoming data
  const output = [key, date, temperature].join(',')
  console.log(output)
  logStream.write(output + '\n');

  let queue = queues.get(key)
  if (queue === undefined) queues.set(key, queue = [])
  if (queue.length >= maxQueueSize) queue.shift()
  queue.push(data)
})

// start actually listening
server.bind(PORT, HOST)

module.exports = queues
