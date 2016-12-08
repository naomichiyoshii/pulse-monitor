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
var BL = 280;
var x = 1000;
var lastv = 0;
var gpio = require("gpio");
var gpio4;
var before_v = 0;
var lowpath = 0.9;

var datalength = 0;

var pulseSPI = {};

var sheetAvailable = false;
var worksheet;
var sheetLength;

var io;

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

      pushRawData.push([new Date(),((d[0] << 8) + d[1]) & 0x03FF]);
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
            BL = v*2/3;
            boo = true;
          } else {
            if (lasty != 0 && lastRRI != 0 && skiptimes == 0 && (nowTime - lastTime < 350 || nowTime - lastTime > 1000) && (nowTime - masterTime > lastRRI + 100 || nowTime - masterTime < lastRRI - 100)) {
              console.log("線形補間: " + lasty);
              data.push(lasty);
              dataset.push([nowTime, Math.floor(lasty)]);
              console.log("push: lasty");
              console.log("RRIデータ数: " + data.length);
              skiptimes += 1;
              return false;
            }
            lastRRI = RRI;
            RRI = nowTime - lastTime;
            BL = v*2/3;
            boo = true;
            if (nowTime - masterTime > x + 1000) {
              x += (Math.floor(((nowTime - masterTime) - x) / 1000)) * 1000;
            }
            if (nowTime - masterTime > x && lastRRI != 0) {
              y = lastRRI + (x + (masterTime - lastTime)) * (RRI - lastRRI) / (nowTime - lastTime);
              if (lasty == 0 && (y > 350 && y < 1000)) {
                lasty = y;
              }else if(skiptimes > 1 && (y > 350 && y < 1000 && (y > (lasty * 0.6) && y < (lasty * 1.4)))){
                lasty = y;
                skiptimes = 0;
              }
              if (lasty != 0 && (y > 350 && y < 1000) && (y > (lasty * 0.8) && y < (lasty * 1.2))) {
                lasty = y;
                console.log("線形補間: " + y);
                data.push(y);
                dataset.push([nowTime, Math.floor(lasty)]);
                console.log("push:  y");
                console.log("RRIデータ数: " + data.length);
              } else if (lasty != 0) {
                console.log("線形補間: " + lasty);
                data.push(lasty);
                dataset.push([nowTime, Math.floor(lasty)]);
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
      if (data.length > 512) {
        data.splice(0, 1);
      }
      if (data.length > 1) {
        var args = data.slice(data.length - Math.pow(2, Math.floor(Math.LOG2E * Math.log(data.length))));
        var phasors = fft(args);
        var frequencies = fftUtil.fftFreq(phasors, 1); // Sample rate and coef is just used for length, and frequency step
        var magnitudes = fftUtil.fftMag(phasors);
        io.emit("data", args);
        //io.emit("fft", frequencies, magnitudes);
        io.emit("rawData", rawData);
      } else {
        io.emit("rawData", rawData);
      }
    }
  });
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
  });
}


process.on('SIGINT', function() {
  console.log("Stop server");
  gpio4.set(0, function() {
    process.exit();
  });
});

module.exports = pulseSPI;
