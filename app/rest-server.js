const express = require('express')
const fs = require('fs')

const temperaturesMap = require('./udp-server')

let thresholds = null

const address = {
  address: '0.0.0.0',
  port: 80
}

const dataPath = __dirname + '/../data'
const thresholdFile = dataPath + '/thresholds.json'

const readThresholds = callback => {
  fs.readFile(thresholdFile, 'utf8', (err, data) => {
    if (err) {
      thresholds = {
        low: 20,
        high: 30
      }
    } else {
      thresholds = JSON.parse(data);
    }
    return callback()
  })
}

const updateThresholds = (newThresholds, callback) => {
  const low = parseFloat(newThresholds.low)
  const high = parseFloat(newThresholds.high)
  if (isNaN(low) || isNaN(high)) {
    return callback('expected low: <float>, high: <float>}')
  }

  thresholds.low = low
  thresholds.high = high

  fs.writeFile(thresholdFile, JSON.stringify(thresholds), 'utf8', (err) => {
    if (err) return callback(err)
    callback()
  })
}

const mapToObject = (map) => {
  // convert a Map to an Object
  return [...map].reduce((obj, entry) => {
    obj[entry[0]] = entry[1]
    return obj
  }, {})
}

const app = express()

app.use('/graph', express.static('www'))

app.route('/')
  .get((req, res) => {
    res.json({
      resources: {
        '/temperatures': {
          methods: ['GET']
        },
        '/thresholds': {
          methods: ['GET', 'PUT']
        }
      },
      static: [
        '/graph'
      ]
    })
  })

app.route('/temperatures')
  .get((req, res) => {
    const temperatures = mapToObject(temperaturesMap)
    res.json({
      temperatures,
      thresholds
    })
  })

app.route('/thresholds')
  .get((req, res) => {
    res.json({thresholds})
  })
  .put((req, res) => {
    updateThresholds(req.query, (err) => {
      if (err) return res.status(500).json({updated: false, error: err.toString()})
      res.json({updated: true})
    })
  })

readThresholds((err) => {
  if (err) throw err

  app.listen(address.port)
  console.log(`REST Server listening on ${address.address}:${address.port}`)
})
