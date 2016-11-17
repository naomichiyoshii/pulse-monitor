//app.js
'use strict'

const os = require('os');
var Slack = require('node-slack');
var slack = new Slack("https://hooks.slack.com/services/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");

let interfaces = os.networkInterfaces();
let mes = '';
for (let dev in interfaces) {
  interfaces[dev].forEach((details) => {
    if (details.internal || details.family !== 'IPv4') return;

    mes = `${os.hostname()} booted on <${details.address}>`;
    slack.send({
      text: mes
    });
    console.log(mes);
  });
}
