$(() => {

    const intervalMillis = 1000

    let lastData = null

    const draw = (data) => {
        if (JSON.stringify(data) == JSON.stringify(lastData)) return
        lastData = data
        if (data.length === 0) {
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
            
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true
                    }
                }
            },
            
            /*
            series: [{
                data: [
                    [1506899236402, 24.6],
                    [1506899297044, 24.5],
                    [1506899343539, 25.2],
                    [1506899346412, 27.9],
                    [1506899347055, 23.1],
                ]
            }],
            */
            series: [{data}],

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
