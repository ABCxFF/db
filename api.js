const fetch = require('node-fetch');
const util = require('./util');

module.exports = async () => {
    const res = fetch("https://ak7oqfc2u4qqcu6i.uvwx.xyz:2222/status", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"macOS\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-gpc": "1",
          "Referer": "https://arras.io/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    }).then(r => r.json()).catch(() => ({ok: false}));

    if (!res.ok) util.throw("Status server API is offline!");

    const servers = [];
    for (const tag in res.status) {
        const server = res.status[tag];
        servers.push({
            tag,
            ...server
        })
    }

    return servers;
}