const getLeaderboard = require('../lib/connection');


getLeaderboard('wss://ak7oqfc2u4qqcu6i.uvwx.xyz:5015/?a=2')
    .then(console.log)
    .catch(console.error);