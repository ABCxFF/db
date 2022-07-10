const db = require('../lib/db');

// db.update([
//     {
//         id: "vc",
//         meta: {
//             code: "vultr-sgp-m2m",
//             host: "f6jklqqdgr0l0kbm.uvwx.xyz:5000",
//             mspt: 5,
//             clients: 5,
//             online: true,
//             uptime: 548.891,
//         },
//         players: [
//             {
//                 id: 401,
//                 name: "abc",
//                 tankName: "Ksss",
//                 score: 122.4,
//                 teamColor: 5 
//             },
//             {
//                 id: 4012,
//                 name: "abc",
//                 tankName: "K",
//                 score: 122.4,
//                 teamColor: 5 
//             }
//         ]
//     }
// ])

console.log(JSON.stringify(db.dump(), null, 2));
