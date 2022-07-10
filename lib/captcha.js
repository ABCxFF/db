const config = require('../config');
const fetch = require('node-fetch');

async function generateToken() {
    const data = await fetch(`https://indecisive-youthful-cabin.glitch.me/${config.API_TOKEN}`).then(r => r.json());

    if (data.status === 'not ok') {
        if (data.retryAfter) { // Sometimes, Puppeteer browsers stale. I make the server timeout the request after 15 seconds, and before doing that restarting the browser and reopening Arras.io.
            return generateToken()
        } else throw data.error // Other reason, most likely an issue with the server.
    } else {
        return data.token;
    }
}


module.exports = generateToken