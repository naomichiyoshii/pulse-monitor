var SPI = require('pi-spi');
var spi = SPI.initialize("/dev/spidev0.0");
var MCP3002 = Buffer([0x68, 0]);

var pulseSPI = {};
pulseSPI.start = function(server, freq){
  var io = require('socket.io')(server);
  io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
  if (!freq) {
    var freq = 128;
  }
  setInterval(function() {
    spi.transfer(MCP3002, MCP3002.length, function (e,d) {
      if (e) {
        console.error(e);
      } else {
        var v = ((d[0]<<8) + d[1]) & 0x03FF
        console.log(v, "Got \""+v.toString()+"\" back.");
      }
  	  });
  }, 1000 / freq);
};

module.exports = pulseSPI;