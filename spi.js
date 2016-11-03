var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var MCP3002 = Buffer([0x68, 0]);
var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var data = [];

var pulseSPI = {};
pulseSPI.start = function(server, freq) {
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
        var v = ((d[0] << 8) + d[1]) & 0x03FF
        data.push(v);
        if (data.length > freq) {
          data.splice(0, data.length - freq);
          var phasors = fft(data);
          var frequencies = fftUtil.fftFreq(phasors, freq); // Sample rate and coef is just used for length, and frequency step
          var magnitudes = fftUtil.fftMag(phasors);
          var both = frequencies.map(function(f, ix) {
            return {
              frequency: f,
              magnitude: magnitudes[ix]
            };
          });
          io.emit("data", data);
          io.emit("fft", both);
          data.splice(0, freq / 2);
          console.log(Date.now());
        }
      }
    });
  }, 1000 / freq);
};

module.exports = pulseSPI;
