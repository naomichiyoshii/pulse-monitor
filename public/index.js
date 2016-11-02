var socket = io();
var chart = Highcharts.chart('container', {
  chart: {
    type: 'spline'
  },
  title: {
    text: 'RRI計測テスト用グラフ',
    x: -20 //center
  },
  xAxis: {
    title: {
      text: 'time(ms)'
    },
    labels: {
      enabled: false
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  yAxis: {
    title: {
      text: 'RRI(ms)'
    },
    max: 1024,
    min: 0,
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  tooltip: {
    valueSuffix: 'ms'
  },
  plotOptions: {
    spline: {
      marker: {
        enabled: false
      }
    },
    series: {
      animation: false
    }
  },
  series: [{
    name: 'RRI',
    data: []
  }]
});

socket.on('data', function(raw_data) {
  chart.series[0].addPoint([Date.now(), raw_data]);
  if (chart.series[0].data.length > 128 * 5) {
    chart.series[0].removePoint(chart.series[0].data[0].x);
  }
});
