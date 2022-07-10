const generateToken = require('./captcha');
const { fasttalk, BroadcastParser, UpdateParser } = require('./coder');
const { Worker } = require('node:worker_threads');
const util = require('./util');
const WebSocket = require('ws');

module.exports = function getLeaderboard(url, cnt=0) {
    return new Promise((res) => {
        if (!url.includes('/?a=2')) url += '/?a=2'; // Appends /?a=2 in case it's missing.
        const ws = new WebSocket(url, ['arras.io#v0+ft2', 'arras.io#v1+ft2']);
        ws.binaryType = 'arraybuffer';
        ws.talk = (...args) => ws.send(fasttalk.encode(args));

        const broadcasts = new BroadcastParser();
        // const world = new UpdateParser();
        const pow = new Worker(`${__dirname}/worker`);
        const mockups = {};
        pow.on('message', function ([chal, ans]) {
            ws.talk('R', chal, ans);
        });

        let ended = false;
        const kill = () => {
            ended = true;
            try {
                ws.close();
            }catch{
                ws.terminate();
            }
            pow.terminate();
        }

        ws.on('open', () => {
            // util.log("ws", "Connection made to " + url);
            ws.talk('k');
            ws.talk('T', JSON.stringify({
                "adblock": false,
                "mobile": true,
                "window": {
                    "innerWidth": 375,
                    "innerHeight": 667
                },
                "tracking": {
                    "name": "",
                    "colors": "normal",
                    "borders": "normal"
                },
                "fingerprints": {
                    "canvas": "v0:BkemObZlhDv1Wjhnf43vlkEtx8HUo5qWZfv/nVgn7Go=",
                    "unicode": "v0:RZcsoLfahBLAtwSftRqENVck8yNHBSBgu2EDTKU2H+g=",
                    "mediaDeviceIds": []
                },
                "report": null
            }
            ));
        });
        ws.on('message', (buf) => {
            if (ended) return kill();
            const data = fasttalk.decode(buf);

            switch (data[0]) {
                case 'K': {
                    util.log("ws", "We have been banned : " + data[0]);
                    res([])
                    kill();
                    break;
                }
                case 'w': {
                    ws.talk('p', 0);

                    const type = data[1];
                    if (type === 1) {
                        ws.talk('s', '', 0); // No captcha
                    } else if (type === 2) { // Captcha required.
                        generateToken().then(token => {
                            console.log(token);
                            ws.talk('s', '', 0, token);
                        }).catch(error => util.throw('CaptchaError', `Failed to complete captcha: ${error}.`));
                    }
                    break;
                }
                case 'u': {
                    ws.talk('d', 0);
                    break;
                }
                case 'J': {
                    const d = data.slice(1);
                    for (const json of d) {
                        if (typeof json !== 'string') continue;
                        const data = JSON.parse(json);
                        mockups[data.index] = data.name;
                    }
                    break;
                }
                case 'm': {
                    // ws.talk('K'); // kys no ttrace lol
                    ws.talk('m', data[1]);
                    break;
                }
                case 'p': {
                    ws.talk('p', ~~(Math.random() * 65536));
                    break;
                }
                case 'C': { // Won't do this until ABC gives optimized PoW Solver.
                    const chal = data[1];

                    pow.postMessage(chal);
                    break;
                }
                case 'b': {
                    broadcasts.parse(data);
                    res(broadcasts.leaderboard.map(p => ({
                        id: p.id,
                        score: p.score,
                        tankName: mockups[p.index],
                        name: p.name,
                        teamColor: p.color
                    })));
                    kill();
                    break;
                }
            }
        })
        ws.on("close", (code, reason) => {
            if (ended) return;
            util.log("ws", "close event before completion in connection");
            util.log("ws", code + ":::" + reason);
            util.log("ws", url);
            if (cnt < 2) {
                return setTimeout(async () => res(await getLeaderboard(url, cnt + 1)), 10000);
            }
            try{util.throw("ConnectionError", "Close event before completion");
            }catch(e){
                console.log(e);
                res([]);
                kill();
            }
        });
        ws.on('error', (err) => {
            if (ended) return;
            util.log("ws", "error event caught in connection");
            util.log("ws", err);
            util.log("ws", url);
            try {util.throw("ConnectionError", err.message)}
            catch(e){
                console.log(e);
                res([]);
                kill();
            }
        })
    });
}