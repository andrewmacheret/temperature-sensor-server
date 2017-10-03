$(() => {

    const intervalMillis = 1000

    let lastData = null

    const draw = (data) => {
        if (JSON.stringify(data) == JSON.stringify(lastData)) return
        lastData = data
        if (Object.keys(data).length === 0) {
            $('#container').text('... no data ...') 
            return
        }
        console.log(data)

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
                    text: 'Temperature (°C)'
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

            series: Object.entries(data).map(series => ({ name: series[0], data: series[1] })),

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
    window.setInterval(() => {
        $.getJSON( "/temperatures", (data) => {
            draw(data.temperatures)
        })
    }, intervalMillis)
})
