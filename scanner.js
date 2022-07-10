const util = require("./lib/util")
const fetchServers = require('./lib/api');
const getLeaderboard = require('./lib/connection');
const db = require('./lib/db');
const poll = async () => {
    util.log("scan", "Scanner polling");
    
    const serverStatus = await fetchServers();

    const servers = await Promise.all(serverStatus.filter(e => e.clients).map(async raw => {
        const meta = {
            uptime: raw.uptime,
            mspt: raw.mspt,
            code: raw.code,
            host: raw.host
        }
        const players = await getLeaderboard("wss://" + raw.host);

        const server = {id: raw.tag, meta, players}

        return server;
    }))

    util.log("scan", `Found ${servers.reduce((a,b)=>a+b.players.length,0)} players amongst ${servers.length} servers`)
    db.update(servers)
}

poll();
setInterval(poll, 1 * 60 * 1000);