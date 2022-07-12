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
        const world = new UpdateParser();
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
                    // random fingerprints
                    "canvas": "v0:" + (Buffer.from(Array(32).fill().map(e=>~~(256*Math.random()))).toString('base64')),
                    "unicode": "v0:" + (Buffer.from(Array(32).fill().map(e=>~~(256*Math.random()))).toString('base64')),
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
                    util.errLog("ws", "We have been kicked : " + data[1]);
                    util.errLog("ws", ws.url);
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
                        generateToken().then(async token => {
                            while (!token) {
                                util.log("ws", "Captcha server API is down, trying again in 10 seconds");
                                token = await generateToken().catch(error => util.throw('CaptchaError', `Failed to complete captcha: ${error}.`));
                            }
                            util.log("ws", "Captcha token generated successfuly for server > 30")
                            ws.talk('s', '', 0, token);
                        }).catch(error => util.throw('CaptchaError', `Failed to complete captcha: ${error}.`));
                    }
                    break;
                }
                case 'u': {
                    world.parse(data)
                    ws.talk('d', 0);
                    if (world.player.points === 42) {
                        let p = world.entities.find(e=>world.player.body.id===e.id);
                        if (p && mockups[p.mockupIndex] !== 'Ranger') {
                            ws.talk('U', 1);
                            ws.talk('U', 0);
                            ws.talk('U', 0);
                        }
                    } else ws.talk('L');
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
                    let p = world.entities.find(e=>world.player.body.id===e.id);
                    if (world.tick < 1500 && p && mockups[p.mockupIndex] !== 'Ranger') break;

                    let lb = broadcasts.leaderboard.map(p => ({
                        id: p.id,
                        score: p.score,
                        tankName: mockups[p.index],
                        name: p.name,
                        teamColor: p.color,
                        onLb: true
                    }));
                
                    lb = lb.concat(world.entities.filter(e => e.layer === 5).filter(p => !lb.includes(p.id)).map(p => ({
                        id: p.id,
                        score: p.score,
                        tankName: mockups[p.mockupIndex],
                        name: p.name,
                        teamColor: p.color,
                        onLb: false
                    })))

                    lb = lb.filter(({id}) => id !== world.player.body.id);

                    res(lb);
                    kill();
                    break;
                }
            }
        })
        ws.on("close", (code, reason) => {
            if (ended) return;
            util.errLog("ws", "close event before completion in connection");
            util.errLog("ws", code + ":::" + reason);
            util.errLog("ws", url);
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
            util.errLog("ws", "error event caught in connection");
            util.errLog("ws", err);
            util.errLog("ws", url);
            try {util.throw("ConnectionError", err.message)}
            catch(e){
                console.log(e);
                res([]);
                kill();
            }
        })
    });
}