// -- IMPORT MODULES -- //

const { CaptchaSolver } = require('./captcha');
const { Encode, Decode, BroadcastParser, UpdateParser } = require('./coder');
const { Worker } = require('node:worker_threads');
const Util = require('./util');
const WebSocket = require('ws');

const SharpSocket = class extends WebSocket { // Extend WebSocket for easier managing.
    constructor(url) {
        if (!url.includes('/?a=2')) url += '/?a=2'; // Appends /?a=2 in case it's missing.
        super(url, ['arras.io#v0+ft2', 'arras.io#v1+ft2']); // Creates socket.
        
        // Instantiates parsers for WebSocket.
        this.CaptchaSolver = new CaptchaSolver();
        this.BroadcastParser = new BroadcastParser();
        this.UpdateParser = new UpdateParser();

        this.Worker = new Worker('./worker');
        
        // Hooks into send function to automatically encode data if not encoded.
        const _send = WebSocket.prototype.send;
        WebSocket.prototype.send = function(data) {
            if (!(data instanceof ArrayBuffer)) data = Encode(data);
            return _send.call(this, data);
        }
        
        // Hooks into message event to emit decodedMessage event
        this.addEventListener('message', function({ data }) {
            this.emit('decodedMessage', Decode(data));
        });
    }
}

const WebSocketManager = class { // A manager to do mass connections to Arras servers with. Prevents clutter within index bot file.
    connect(url) {
        return new Promise((resolve, reject) => {
            const socket = new SharpSocket(url);
        
            socket.on('open', function() {
                Util.log('connection', `A connection has been made to ${url}. Starting protocol...`);
                
                const tracking = { // Tracking info (these are my fingerprints so they may be banned so avoid using them)
                    "adblock": false,
                    "mobile": false,
                    "window": {
                        "innerWidth": 1150,
                        "innerHeight": 969
                    },
                    "tracking": {
                        "name": "",
                        "colors": "TGlnaHQgQ29sb3JzAE5lcGgApnrbvLnofueJbf3zgLWO/e+Zw+jr96qfnv///0hISDyky4q8P+A+Qe/HS41q38xmnKenr3Jvb9vb2wAAAA",
                        "borders": "normal"
                    },
                    "fingerprints": {
                        "canvas": "v0:87hbcidT6nB8gVW0hNwrf0f35ZFpNaV4Jzkk7vjVj80=",
                        "mediaDeviceIds": [],
                        "unicode": "v0:tnW6gQW4uzFv1Mu47ijokO0X149GtDSdtXlFfL+RseA="
                    },
                    "report": null
                };
    
                socket.send(['T', JSON.stringify(tracking)]);
                socket.send(['k']);
            });
    
            socket.on('decodedMessage', function(data) {
                switch (data[0]) {
                    case 'w': {
                        const type = data[1];
                        if (type === 1) {
                            socket.send(['s', '', 0]); // No captcha verification required.
                            socket.send(['p', 0]);
                        } else if (type === 2) { // Captcha verification required.
                            socket.CaptchaSolver.generateToken()
                                .then(token => {
                                    socket.send(['s', '', 0, token]);
                                    socket.send(['p', 0]);
                                })
                                .catch(error => Util.throw('CaptchaError', `Failed to complete captcha: ${error}.`));
                        }
    
                        break;
                    }
                    case 'u': {
                        socket.UpdateParser.parse(data);
                        socket.send(['d', 0]);
                        
                        break;
                    }
                    case 'm': { // When logging packets, apparently it echos message packets (why the fuck?).
                        socket.send(data);
                        break;
                    }
                    case 'p': {
                        socket.send(['p', 0]);
                        break;
                    }
                    case 'C': { // Won't do this until ABC gives optimized PoW Solver.
                        const challenge = data[1];

                        socket.Worker.on('message', function({ data: [chal, ans] }) {
                            socket.send(['R', chal, ans]);

                            socket.Worker.off('message', err => Util.throw('worker', `Could not disconnect worker: ${err?.message || err}`));
                        });

                        socket.Worker.postMessage(challenge);
                        break;
                    }
                    case 'b': {
                        socket.BroadcastParser.parse(data);
                        resolve(socket.BroadcastParser.leaderboard);
                        Util.log('connection', 'Finished parsing leaderboard.');
                        socket.terminate();
                    }
                }
            });
        });
    }
}