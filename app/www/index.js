$(() => {

    let lastData = null
    let interval = null

    const draw = (data, redraw=false) => {
        if (redraw) {
            data = lastData
        } else {
            if (JSON.stringify(data) == JSON.stringify(lastData)) return
            lastData = data
        }

        const unit = document.forms.options.temperatureUnit.value

        if (Object.keys(data).length === 0) {
            $('#container').text('... no data ...') 
            return
        }
        //console.log(data)

        Highcharts.chart('container', {

            title: {
                text: 'Temperature Data'
            },

            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Time'
                }
            },
            yAxis: {
                title: {
                    text: `Temperature (°${ unit === 'celcius' ? 'C' : 'F' })`
                }
            },
            
            credits: {
                enabled: false
            },
            
            /*
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

            series: Object.entries(data).map(series => ({ name: series[0], data: series[1].map(dataPoint => {
                if (unit === 'celcius') return dataPoint
                // fahrenheit
                return [dataPoint[0], dataPoint[1] * 1.8 + 32]
            }) })),

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

        })
    }

    // define function when the interval input changes
    const onChangeInterval = () => {
        if (interval !== null) clearInterval(interval)
        $('#drew').html('...')

        const intervalMillis = parseInt(document.forms.options.interval.value, 10)
        interval = window.setInterval(() => {
            $.getJSON( "/temperatures", (data) => {
                draw(data.temperatures)
                $('#drew').html('&#x2714;')
            })
        }, intervalMillis)
    }

    // define function when the temperature unit changes
    const onChangeTemperatureUnit = () => {
        // redraw
        draw(null, true)
    }

    // engage listeners
    document.forms.options.temperatureUnit.forEach(radio => { radio.addEventListener('click', onChangeTemperatureUnit, false) })
    document.forms.options.interval.addEventListener('input', onChangeInterval, false)

    // kick off by setting a new interval
    onChangeInterval()
})
