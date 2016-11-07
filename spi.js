var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var MCP3002 = Buffer([0x68, 0]);
var fft = require('fft-js').fft;
var fftUtil = require('fft-js').util;
var data = [];
var oldData = 512;
var boo = new Boolean(false);
var lastTime = 0;
var RRI = 0;
var BL = 340;
var lastv = 0;
var gpio = require("gpio");
var gpio4;

var pulseSPI = {};

pulseSPI.start = function(server, freq) {
  gpio4 = gpio.export(4, {
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
var txt = "";
for(var i = 0; i < v/8; i++){
txt+="*";
}
console.log(txt);
              if(v > BL && !boo){
                if(v < lastv){
                  boo = true;
                  var nowTime = new Date();
                  if(lastTime != 0){
                    RRI = nowTime - lastTime;
                    data.push(RRI);
                  }
                  lastTime = nowTime;
                }
                lastv = v;
              }else if (v < BL && boo) {
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
                io.emit("fft", frequencies, magnitudes);
              }
            }
          });
        }, 100);
      });
    }
  });
};

process.on('SIGINT', function() {
  console.log("Stop server");
  gpio4.set(0, function(){
    process.exit();
  });
});

module.exports = pulseSPI;
