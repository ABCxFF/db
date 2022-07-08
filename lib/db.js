const { existsSync, readFileSync, writeFileSync, appendFileSync } = require('fs');
const util = require('./util');

const OBJ_FILE = './db/OBJ.db';
const SsTR_FILE = './db/STR.db';

if (!existsSync(OBJ_FILE)) {
    util.log('db', "Object database file does not exist. Creating at " + OBJ_FILE);
    writeFileSync(OBJ_FILE, Buffer.from([]));
}

if (!existsSync(STR_FILE)) {
    util.log('db', "String map file does not exist. Creating at " + STR_FILE);
    writeFileSync(STR_FILE, Buffer.from([]));
}

const db = {};

db.getStringRef = (str) => {
    const buffer = Buffer.from(str);
    const raw = readFileSync(STR_FILE, 'binary');
    const offset = raw.indexOf(buffer);

    if (offset === -1) {
        appendFileSync(STR_FILE, buffer);
        return new Uint32Array([raw.byteLength, buffer.byteLength])
    }

    return new Uint32Array([offset, buffer.byteLength])
}

db.updateServer = (server) => {
    const meta = {...server};

    clients: 19
    code: "hetzner-fsn-2"
    host: "hq3p9viv64d0js08.uvwx.xyz:5001"
    mspt: 11.03
    name: "hb"
    online: true
    uptime: 2347.14
}