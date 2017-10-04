$(() => {
    // read the query string and form values
    location.queryString = {}
    location.search.substr(1).split('&').forEach((pair) => {
        if (pair === '') return
        const parts = pair.split('=')
        location.queryString[parts[0]] = parts[1] && decodeURIComponent(parts[1].replace(/\+/g, ' '))
    })
    if (location.queryString.refresh !== undefined) {
        document.forms.options.refresh.value = location.queryString.refresh
    }
    if (location.queryString.units !== undefined) {
        document.forms.options.units.forEach(radio => {
            if (radio.value === location.queryString.units) {
                radio.checked = true
            }
        })
    }

    const toFahrenheit = cel => cel * 1.8 + 32

    let lastData = null
    let interval = null

    const draw = (data, redraw=false) => {
        if (redraw) {
            data = lastData
        } else {
            if (JSON.stringify(data) == JSON.stringify(lastData)) return
            lastData = data
        }

        if (Object.keys(data).length === 0) {
            $('#container').text('... no data ...') 
            return
        }

        const temperatures = data.temperatures
        const thresholds = data.thresholds

        if (document.forms.options['threshold-low'].value === '') {
            document.forms.options['threshold-low'].value = thresholds.low
        }
        if (document.forms.options['threshold-high'].value === '') {
            document.forms.options['threshold-high'].value = thresholds.high
        }

        const units = document.forms.options.units.value

        let min = thresholds.low
        let max = thresholds.high
        Object.entries(temperatures).forEach(series => {
            series[1].forEach(datum => {
                const temperature = datum[1]
                if (min > temperature) min = temperature
                if (max < temperature) max = temperature
            })
        })

        Highcharts.chart('container', {
            chart: {
                type: 'spline'
            },

            title: {
                text: 'Temperature Data'
            },

            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Time (UTC)'
                }
            },

            yAxis: {
                title: {
                    text: `Temperature (°${ units === 'celcius' ? 'C' : 'F' })`
                },
                plotLines: [{
                        value: units === 'celcius' ? thresholds.low : toFahrenheit(thresholds.low),
                        color: 'blue',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            text: 'Too Cold'
                        }
                    }, {
                        value: units === 'celcius' ? thresholds.high : toFahrenheit(thresholds.high),
                        color: 'red',
                        dashStyle: 'shortdash',
                        width: 2,
                        label: {
                            text: 'Too Hot'
                        }
                }],
                min: units === 'celcius' ? min : toFahrenheit(min),
                max: units === 'celcius' ? max : toFahrenheit(max)
            },
            
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },

            credits: {
                enabled: false
            },
            
            /*
            example...

            series: [{
                name: 'be:ef@12:34:56:78:9a:bc',
                data: [
                    [1506899236402, 24.6],
                    [1506899297044, 24.5],
                    [1506899343539, 25.2],
                    [1506899346412, 27.9],
                    [1506899347055, 23.1],
                ]
            }],
            */

            series: Object.entries(temperatures).map(series => ({ name: series[0], data: series[1].map(dataPoint => {
                if (units === 'celcius') return dataPoint
                return [dataPoint[0], toFahrenheit(dataPoint[1])]
            }) })),

            /*
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
            */

        })
    }

    const callTemperaturesApi = () => {
        $.getJSON('/temperatures', data => {
            draw(data)
            $('#drew').html('&#x2714;') // checkmark
            $('#updated-thresholds').html('&#x2714;') // checkmark
        })
    }

    // define function when the interval input changes
    const onChangeInterval = () => {
        $('#drew').html('...')
        if (interval !== null) clearInterval(interval)

        const intervalMillis = parseInt(document.forms.options.refresh.value, 10)
        interval = window.setInterval(callTemperaturesApi, intervalMillis)
    }

    // define function when the temperature unit changes
    const onChangeTemperatureUnit = () => {
        // redraw
        draw(null, true)
    }

    // define function when thresholds change
    const onChangeThreshold = () => {
        $('#updated-thresholds').html('X')
        const low = parseFloat(document.forms.options['threshold-low'].value)
        const high = parseFloat(document.forms.options['threshold-high'].value)
        if (isNaN(low) || isNaN(high)) return
        $('#updated-thresholds').html('...')

        $.ajax({
            url: `/thresholds?low=${low}&high=${high}`,
            method: 'PUT',
            dataType: 'json'
        }).fail(() => {
            $('#updated-thresholds').html('X')
        }).done(status => {
            if (!status.updated) {
                $('#updated-thresholds').html('X')
                return
            }

            $('#updated-thresholds').html('&#x2714;') // checkmark

            lastData.thresholds.low = low
            lastData.thresholds.high = high

            // redraw
            draw(null, true)
        })
    }

    // engage listeners
    document.forms.options.units.forEach(radio => { radio.addEventListener('click', onChangeTemperatureUnit, false) })
    document.forms.options.refresh.addEventListener('input', onChangeInterval, false)
    ;[
        document.forms.options['threshold-low'],
        document.forms.options['threshold-high']
    ].forEach(field => { field.addEventListener('input', onChangeThreshold, false) })

    // kick off by calling the temperatures api immediately
    callTemperaturesApi()
})
