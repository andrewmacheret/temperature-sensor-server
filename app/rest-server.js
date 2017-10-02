const express = require('express')

const temperatures = require('./udp-server')

const app = express()

const address = {
  address: '0.0.0.0',
  port: 8080
}

app.use('/temperatures/graph', express.static('www'))

app.route('/')
  .get((req, res) => {
    res.json({'resources': {
      '/temperatures': [
        'GET /',
        'GET /graph'
      ]
    }})
  })

app.route('/temperatures')
  .get((req, res) => {
    res.json({'temperatures': temperatures})
  })

app.listen(address.port)
console.log(`REST Server listening on ${address.address}:${address.port}`)
