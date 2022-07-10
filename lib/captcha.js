const {existsSync, appendFileSync, writeFileSync} = require('fs');
const config = require('../config');
const fetch = require('node-fetch');
const util = require('./util');

async function generateToken() {
    const text = await fetch(`https://indecisive-youthful-cabin.glitch.me/${config.API_TOKEN}`).then(r => r.text());
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        util.errLog("captcha", "Exception caught");
        util.errLog("captcha", e);
        util.errLog("captcha", text);
        if (!existsSync('./captchaErr.txt')) writeFileSync("./captchaErr.txt", "");
        appendFileSync("./captchaErr.txt", text);
        await new Promise(r => setTimeout(r, 2000));
        return generateToken()
    }
    if (data.status === 'not ok') {
        if (data.retryAfter) { // Sometimes, Puppeteer browsers stale. I make the server timeout the request after 15 seconds, and before doing that restarting the browser and reopening Arras.io.
            return generateToken()
        } else throw data.error // Other reason, most likely an issue with the server.
    } else {
        return data.token;
    }
}


module.exports = generateToken