const { WebSocketManager } = require('../lib/connection');

const manager = new WebSocketManager();
manager.connect('wss://ak7oqfc2u4qqcu6i.uvwx.xyz:5001/?a=2')
    .then(console.log)
    .catch(console.error);