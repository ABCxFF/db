const db = require('../lib/db');

db.update([
    {
        id: "vc",
        meta: {
            code: "vultr-sgp-m2m",
            host: "f6jklqqdgr0l0kbm.uvwx.xyz:5000",
            mspt: 4.36,
            clients: 5,
            online: true,
            uptime: 524.891,
        },
        players: [
            {
                id: 400,
                name: "abc",
                tankName: "Twin",
                score: 123.4,
                teamColor: 5,
                uptimeRn: 524.891   
            }
        ]
    }
])

db.log();
