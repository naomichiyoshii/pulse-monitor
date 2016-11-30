var socket = io();

function startRRI(){
  var GoogleSpreadsheet = require('google-spreadsheet');
  var my_sheet = new GoogleSpreadsheet("1_blqESLe2bVW3yUqcXVRejwtizhntQBNv__wv3ZY0ww");
  var credentials = require('./google-generated-creds.json');
  var sheet;
  var ret = confirm("RRIの計測を開始します。よろしいですか？");
  if(ret == true){
    my_sheet.useServiceAccountAuth(credentials, function(err){
        my_sheet.getInfo(function(err, data){
          console.log(data);
          sheet = data; //あとから使えるように外部スコープに保存
          for(var i in sheet.worksheets) {
              if(sheet.worksheets[i].title === 'シート1') {
                  sheet.worksheets[i].getRows( function( err, rows ) {
                      for(var i in rows) {
                          console.log(rows[i]);
                      }
                  });
              }
          }
        });


    });
  }
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
socket.on('data2', function(raw_data) {
  vchart.series[0].setData(raw_data);
});
socket.on('data', function(raw_data) {
  chart.series[0].setData(raw_data);
});
socket.on('fft', function(frequencies, magnitudes) {
  fft_chart.xAxis[0].setCategories(frequencies);
  fft_chart.series[0].setData(magnitudes);
});
