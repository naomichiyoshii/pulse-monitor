var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var MCP3002 = Buffer([0x68, 0]);
var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var data = [];
var rawData = [];
var pushRawData = [];
var dataset = [];
var oldData = 512;
var boo = new Boolean(false);
var lastTime = 0;
var masterTime = 0;
var lowpath_v = 0;
var RRI = 0;
var lastRRI = 0;
var skiptimes = 0;
var lasty = 0;
var y = 0;
var BL = 22;
0;
var x = 1000;
var lastv = 0;
var gpio = require("gpio");
var gpio4;
var before_v = 0;
var lowpath = 0.9;

var datalength = 0;

var top = [];

var pulseSPI = {};

var sheetAvailable = false;
var worksheet;
var sheetLength;

var io;

var responseRRI = [];

var google_module = require('./google_module');

pulseSPI.start = function(server, freq) {
  google_module.init();
  initSocket(server);
  gpio4 = gpio.export(4, {
    direction: 'out',
    ready: function() {
      gpio4.set(function() {
        if (!freq) {
          var freq = 128;
        }
        setInterval(dataCalc, 50);
      });
    }
  });
};

function sendData() {
  google_module.appendData(dataset);
  google_module.appendRawdata(pushRawData);
  dataset = [];
  pushRawData = [];
}

function dataCalc() {
  spi.transfer(MCP3002, MCP3002.length, function(e, d) {
    if (e) {
      console.error(e);
    } else {
      //High-pass filter
      if (before_v == 0) {
        var v = ((d[0] << 8) + d[1]) & 0x03FF;
        before_v = v;
      } else {
        lowpath_v = 　lowpath * before_v + (1 - lowpath) * ((d[0] << 8) + d[1]) & 0x03FF;
        before_v = lowpath_v;
        var v = (((d[0] << 8) + d[1]) & 0x03FF) - lowpath_v;
      }

      // Low-pass filter
      // if(before_v == 0){
      //    var v = ((d[0] << 8) + d[1]) & 0x03FF;
      //    before_v = v;
      // }else{
      //   var v = (((d[0] << 8) + d[1]) & 0x03FF);
      //   lowpath_v =　(1 - lowpath) * before_v + lowpath * v;
      //   before_v = lowpath_v;
      // }
      // console.log(v);

      pushRawData.push([new Date().getTime(), ((d[0] << 8) + d[1]) & 0x03FF]);
      rawData.push(v);
      if (rawData.length > 256) {
        rawData.splice(0, 1);
      }
      if (v > BL && !boo) {
        if (v < lastv) {
          var nowTime = new Date();
          if (lastTime == 0) {
            lastTime = nowTime;
            masterTime = nowTime;
            if (v > (BL - 250) || v < (BL + 250)) {
              top.push(v);
            }
            boo = true;
          } else {
            if (lasty != 0 && lastRRI != 0 && skiptimes == 0 && (nowTime - lastTime < 350 || nowTime - lastTime > 1000) && (nowTime - masterTime > lastRRI + 100 || nowTime - masterTime < lastRRI - 100)) {
              console.log("線形補間: " + lasty);
              data.push(lasty);
              dataset.push([nowTime.getTime(), Math.floor(lasty)]);
              console.log("push: lasty");
              console.log("RRIデータ数: " + data.length);
              skiptimes += 1;
              return false;
            }
            lastRRI = RRI;
            RRI = nowTime - lastTime;
            if (v > (BL - 250) || v < (BL + 250)) {
              top.push(v);
            }
            boo = true;
            if (nowTime - masterTime > x + 1000) {
              x += (Math.floor(((nowTime - masterTime) - x) / 1000)) * 1000;
            }
            if (nowTime - masterTime > x && lastRRI != 0) {
              y = lastRRI + (x + (masterTime - lastTime)) * (RRI - lastRRI) / (nowTime - lastTime);
              if (lasty == 0 && (y > 350 && y < 1200)) {
                lasty = y;
              } else if (skiptimes > 0 && (y > 350 && y < 1200) && (y > (lasty * 0.5))) {
                lasty = y;
                skiptimes = 0;
              }
              if (lasty != 0 && (y > 350 && y < 1200) && (y > (lasty * 0.7) && y < (lasty * 1.3))) {
                lasty = y;
                console.log("線形補間: " + y);
                data.push(y);
                dataset.push([nowTime.getTime(), Math.floor(lasty)]);
                console.log("push:  y");
                console.log("RRIデータ数: " + data.length);
              } else if (lasty != 0 && skiptimes == 0) {
                console.log("線形補間: " + lasty);
                data.push(lasty);
                dataset.push([nowTime.getTime(), Math.floor(lasty)]);
                console.log("push: second lasty");
                console.log("RRIデータ数: " + data.length);
                skiptimes += 1;
              }
              x += 1000;
            }
            lastTime = nowTime;
          }
        }
        lastv = v;
      } else if (v < BL && boo) {
        boo = false;
      }
      if (top.length > 2) {
        var total = 0;
        for (var i = 0; i < top.length; i++) {
          total += top[i];
        }
        var ave = total / top.length;
        BL = Math.floor(ave * 2 / 3);
        top.splice(0, 1);
        console.log("BL: " + BL);
      }
      if (data.length > 512) {
        data.splice(0, 1);
      }
      if (data.length > 1) {
        // var args = data.slice(data.length - Math.pow(2, Math.floor(Math.LOG2E * Math.log(data.length))));
        // var phasors = fft(args);
        // var frequencies = fftUtil.fftFreq(phasors, 1); // Sample rate and coef is just used for length, and frequency step
        // var magnitudes = fftUtil.fftMag(phasors);
        //io.emit("data", args);
        //io.emit("fft", frequencies, magnitudes);
        //io.emit("rawData", rawData);
      } else {
        //io.emit("rawData", rawData);
      }
    }
  });
}

function startAnalysis(){
    console.log(fft);
    var fftargs = [557,702,704,688,781,628,737,651,664,733,580,752,706,777,777,790,650,652,846,751,796,707,707,766,803,803,1078,1140,1140,708,744,616,721,689,637,797,739,741,846,720,808,822,742,918,780,886,826,809,823,753,665,840,776,652,652,947,802,682,698,744,672,713,735,613,749,556,556,725,688,655,660,763,867,763,874,909,832,886,709,791,781,803,801,852,835,831,888,810,802,781,709,846,732,803,698,665,794,685,677,665,737,706,772,734,626,761,709,709,720,812,766,732,718,703,702,751,752,752,710,693,780,760,745,772,853,755,877,813];
    // var fftargs = responseRRI.slice(responseRRI.length - Math.pow(2, Math.floor(Math.LOG2E * Math.log(responseRRI.length))));
    console.log('fftargs: ' + fftargs);
    var phasors = fft(fftargs);
    console.log(phasors);
    var frequencies = fftUtil.fftFreq(phasors, 1); // Sample rate and coef is just used for length, and frequency step
    var magnitudes = fftUtil.fftMag(phasors);
    frequencies.splice(0, 1);
    magnitudes.splice(0, 1);
    console.log('パワー配列： ' + magnitudes);
    console.log('周波数配列： ' + frequencies);
    var LF = 0;
    var HF = 0;
    for(var i = 0; i < frequencies.length; i++){
      if(frequencies[i] > 0.05 && frequencies[i] < 0.15){
        LF += magnitudes[i];
      }else if(frequencies[i] > 0.15 && frequencies[i] < 0.40){
        HF += magnitudes[i];
      }
    }
    console.log('LF： ' + LF);
    console.log('HF： ' + HF);
    console.log('LF/HF： ' + LF/HF);
    io.emit("fft", frequencies, magnitudes);
}

function initSocket(server) {
  io = require('socket.io')(server);
  io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
    socket.on('startUpload', function(socket) {
      console.log('Create Sheet');
      google_module.createSheet(function() {
        console.log('Start Upload');
        dataset = [];
        pushRawData = [];
        sendDataInterval = setInterval(sendData, 5000);
      });
    });
    socket.on('stopUpload', function(socket) {
      console.log('Stop Upload');
      clearInterval(sendDataInterval);
    });
    socket.on('startAnalysis', function(socket) {
      console.log('Start Analysis');
      google_module.setAnalysisData(function(back){
      responseRRI = back;
      startAnalysis();
      });
    });
  });
}


process.on('SIGINT', function() {
  console.log("Stop server");
  gpio4.set(0, function() {
    process.exit();
  });
});

module.exports = pulseSPI;
