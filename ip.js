//app.js
'use strict'

const os = require('os');
let interfaces = os.networkInterfaces();
let mes = '';

for (let dev in interfaces) {
    interfaces[dev].forEach((details) => {
        if (details.internal || details.family !== 'IPv4') return;

        mes = `${os.hostname()}:${details.address} (standup)`;
        console.log(mes);
    });
}
