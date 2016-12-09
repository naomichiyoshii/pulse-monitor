var socket = io();

function startRRI(){
  var ret = confirm("RRIの測定を開始します。よろしいですか？");
  if(ret == true){
    socket.emit("startUpload");
  }
}

function stopRRI() {
  socket.emit("stopUpload");
}

function startFFT() {
  socket.emit("startAnalysis");
}

var vchart = Highcharts.chart('rawdata', {
  chart: {
    animation: false,
    type: 'spline'
  },
  title: {
    text: '心拍生データ',
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
      text: 'power(v)'
    },
    max: 1500,
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
    series: {
      marker: {
        enabled: false
      }
    }
  },
  series: [{
    name: 'rawdata',
    data: []
  }]
});
var chart = Highcharts.chart('container', {
  chart: {
    animation: false,
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
    max: 1500,
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
    series: {
      marker: {
        enabled: false
      }
    }
  },
  series: [{
    name: 'RRI',
    data: []
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
      text: 'frequency(Hz)'
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
socket.on('rawData', function(raw_data) {
  vchart.series[0].setData(raw_data);
});
socket.on('data', function(raw_data) {
  chart.series[0].setData(raw_data);
});
socket.on('fft', function(frequencies, magnitudes) {
  fft_chart.xAxis[0].setCategories(frequencies);
  fft_chart.series[0].setData(magnitudes);
}
);
