var socket = io();
var data = [];
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
    data: data
  }]
});

socket.on('data', function(raw_data) {
  data.push(raw_data);
  while (data.length > 32 * 5) {
    data.splice(0, 1);
  }
  chart.series[0].setData(data);
});
