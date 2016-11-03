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
    data: [512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512, 512]
  }]
});
var fft_chart = Highcharts.chart('fft', {
  chart: {
    type: 'areaspline'
  },
  title: {
    text: 'FFTによるスペクトル解析結果',
    x: -20 //center
  },
  xAxis: {
    title: {
      text: 'frequency(kHz)'
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  yAxis: {
    title: {
      text: 'power'
    },
    max: 18000,
    min: 0,
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  plotOptions: {
    series: {
      animation: false,
      marker: {
        enabled: false
      }
    }
  },
  series: [{
    name: 'Power',
    data: []
  }]
});
socket.on('data', function(raw_data) {
  chart.series[0].removePoint(0);
  chart.series[0].addPoint(raw_data);
});
socket.on('fft', function(fft_data) {
  var fft_categories = [];
  var fft_series = [];
  fft_data.forEach(function(element, index, array) {
    fft_categories.push(element.frequency);
    fft_series.push(element.magnitude);
  });
  fft_chart.xAxis[0].setCategories(fft_categories);
  fft_chart.series[0].setData(fft_series);
});
