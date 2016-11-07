var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var MCP3002 = Buffer([0x68, 0]);
var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var data = [];
var oldData = 512;
var gpio = require("gpio");

var pulseSPI = {};
pulseSPI.start = function(server, freq) {

  var gpio4 = gpio.export(4, {
    direction: 'out',
    ready: function() {
      gpio4.set(function() {

        var io = require('socket.io')(server);
        io.on('connection', function(socket) {
          console.log('a user connected');
          socket.on('disconnect', function() {
            console.log('user disconnected');
          });
        });
        if (!freq) {
          var freq = 128;
        }
        setInterval(function() {
          spi.transfer(MCP3002, MCP3002.length, function(e, d) {
            if (e) {
              console.error(e);
            } else {
              var v = ((d[0] << 8) + d[1]) & 0x03FF;
              data.push(v);
              if (data.length > 512) {
                data.splice(0, 1);
              }
              if (data.length > 1) {
                var args = data.slice(data.length - Math.pow(2, Math.floor(Math.LOG2E * Math.log(data.length))));
                var phasors = fft(args);
                var frequencies = fftUtil.fftFreq(phasors, 1); // Sample rate and coef is just used for length, and frequency step
                var magnitudes = fftUtil.fftMag(phasors);
                io.emit("data", args);
                io.emit("fft", frequencies, magnitudes);
                console.log(Date.now());
              }
            }
          });
        }, 100);
      });
    }
  });
};

module.exports = pulseSPI;
