const Config = require('../config');
const fetch = require('node-fetch');

const CaptchaSolver = class {
    constructor() {
        this.API_TOKEN = Config.API_TOKEN;
    }

    generateToken() {
        return new Promise((resolve, reject) => {
            fetch(`https://indecisive-youthful-cabin.glitch.me/${this.API_TOKEN}`).then(r => r.json()).then(data => {
                if (data.status === 'not ok') {
                    if (data.retryAfter) { // Sometimes, Puppeteer browsers stale. I make the server timeout the request after 15 seconds, and before doing that restarting the browser and reopening Arras.io.
                        this.generateToken().then(resolve).catch(reject); // Recursively calls function if Puppeteer browser stales.
                    } else reject(data.error); // Other reason, most likely an issue with the server.
                } else {
                    resolve(data.token);
                }
            });
        });
    }
}

module.exports = { CaptchaSolver };