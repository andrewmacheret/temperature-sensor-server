// this script is meant for testing only
const dgram = require('dgram')
const macaddress = require('macaddress')
const binstruct = require('binstruct')

// define port and host to send to
const PORT = 30
const HOST = '127.0.0.1'

// function to convert a byte to a hex string
const byteToHex = (b) => {
  const h = (+b).toString(16);
  return h.length < 2 ? '0' + h : h
}

// get the mac address as an array of bytes
const macString = Object.values(macaddress.networkInterfaces())[0].mac
const mac = macString.split(':').map(s => parseInt(s, 16))
console.log(`mac address: ${mac.map(byteToHex).join(':')}`)

// choose an arbritary but consistent id as 2 bytes
const deviceId = [0xbe, 0xef]
console.log(`device id: ${deviceId.map(byteToHex).join(':')}`)

// choose a random temperature between a MIN and MAX
const MIN_TEMPERATURE = 24.0
const MAX_TEMPERATURE = 26.0
const temperature = Math.random() * (MAX_TEMPERATURE - MIN_TEMPERATURE) + MIN_TEMPERATURE
console.log(`temperature: ${temperature.toFixed(3)}`)

// construct a binary structure in the following format
// M M M M M M I I T T T T
// where M is a mac address byte (6 byte hex)
//   and I is an ID byte (2 byte hex)
//   and T is a temperature byte (4 byte float)
const binary = binstruct.def({littleEndian: false})
mac.forEach(b => binary.byte(b))
deviceId.forEach(b => binary.byte(b))
binary.float(temperature)
// ensure the binary struct is the right length, and convert to a buffer
const message = binary.checkSize(12).write()

// send the buffer as a UDP packet
const client = dgram.createSocket('udp4')
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) throw err
    console.log(`UDP message sent to ${HOST}:${PORT} - ${message.length} bytes - ${message.toString('hex')}` )
    client.close()
});
