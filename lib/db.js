const { existsSync, readFileSync, writeFileSync, appendFileSync, fstat } = require('fs');
const util = require('./util');

const OBJ_FILE = './db/OBJ.db';
const STR_FILE = './db/STR.db';

// empty the objects
if (!existsSync(OBJ_FILE)) {
    util.errLog('db', "Object database file does not exist. Creating at " + OBJ_FILE);
    writeFileSync(OBJ_FILE, Buffer.from([]));
}

if (!existsSync(STR_FILE)) {
    util.errLog('db', "String map file does not exist. Creating at " + STR_FILE);
    writeFileSync(STR_FILE, Buffer.from([]));
}

// BIG OBJECTS
// these two properties can store large amounts of stuff rn
const db = {data:readFileSync(OBJ_FILE),nameCache:readFileSync(STR_FILE)};
// increases the size of buffer and returns the new larger buffer
const grow = (buffer, amount, addr=buffer.byteLength) => {
    const newDb = Buffer.alloc(buffer.byteLength + amount)
    newDb.set(buffer.subarray(0, addr), 0);
    newDb.set(buffer.subarray(addr), addr + amount);
    return newDb;
}
// grows specifically the database
db.grow = (amount, addr=db.data.byteLength) => db.data = grow(db.data, amount, addr)

// this returns a "string reference", it takes the string and finds 
// then if it doesn't exist in the STR_FILE already, it finds the
// optimal spot to store it inside of STR_FILE, then returns Buffer<u32:addr, u8:len>
// if it exists, it returns Buffer<u32:addr, u8:len>
const getRefOfStr = (str) => {
    const buffer = Buffer.from(str);
    if (buffer.length >= 0x100) util.throw("RangError", "Unexpected string size " + buffer.length + ". String size may not be >= 0x100");
    const offset = db.nameCache.indexOf(buffer);

    if (offset === -1) {
        appendFileSync(STR_FILE, buffer);
        const at = db.nameCache.byteLength;
        db.nameCache = grow(db.nameCache, buffer.byteLength);
        db.nameCache.set(buffer, at);
        const refBuf = Buffer.alloc(5);
        refBuf.writeUint32LE(at, 0);
        refBuf.writeUint8(buffer.byteLength, 4);
        return refBuf;
    }

    const refBuf = Buffer.alloc(5);
    refBuf.writeUint32LE(offset, 0);
    refBuf.writeUint8(buffer.byteLength, 4);
    return refBuf;
}

// Takes [addr, len] and returns a "string"
const getStrOfRef = ([byteOffset, byteLength]) => {
    return db.nameCache.subarray(byteOffset, byteOffset+byteLength).toString();
}

const kSizeOfServer = 4 + 8 + 4 + 4 + 5 + 1 + 5 + 4 // size of the struct
const readServer = (addr) => {
    // basically reads data off an address and puts into an object - parses struct
    const server = {_addr:addr,meta:{}};
    const {meta} = server;
    let pos = addr;
    server.id = db.data.subarray(pos, Math.min(db.data.indexOf(0xFF, pos), pos += 4)).toString();
    server.start = db.data.readDoubleLE(pos);
    pos += 8;
    meta.mspt = db.data.readFloatLE(pos);
    pos += 4;
    meta.uptime = db.data.readFloatLE(pos);
    pos += 4;

    meta.code = [db.data.readUint32LE(pos), db.data.readUint8(pos + 4)]
    pos += 5;
    server.pollCount = db.data.readUint8(pos++);
    meta.host = [db.data.readUint32LE(pos), db.data.readUint8(pos + 4)]
    pos += 5;

    server.playerCount = db.data.readUint32LE(pos);
    pos += 4;
    server.playersPtr = pos;

    return server;
}
const kSizeOfPlayer = 4 + 5 + 1 + 5 + 4 + 4 + 4// size of the struct
const readPlayer = (addr) => {
    // basically reads data off an address and puts into an object - parses struct
    const player = {_addr:addr};
    let pos = addr;
    player.id = db.data.readUInt32LE(pos);
    pos += 4;
    player.name = [db.data.readUint32LE(pos), db.data.readUint8(pos + 4)]
    pos += 5;
    player.teamColor = db.data.readUint8(pos++);
    player.tankName = [db.data.readUint32LE(pos), db.data.readUint8(pos + 4)]
    pos += 5;
    player.firstSeen = db.data.readFloatLE(pos);
    pos += 4;
    player.lastSeen = db.data.readFloatLE(pos);
    pos += 4;
    player.lastSeenScore = db.data.readFloatLE(pos);
    pos += 4;
    return player;
}
const writePlayer = (addr, player) => {
    // basically reads data off an address and puts into an object - parses struct
    let pos = addr;
    let needsInit = db.data.readUInt32LE(pos) === 0;
    if (needsInit) db.data.writeUint32LE(player.id, pos);
    pos += 4;
    if (needsInit) db.data.set(getRefOfStr(player.name), pos);
    pos += 5;
    if (needsInit) db.data.writeUint8(player.teamColor, pos);
    pos += 1;
    // could've upgraded
    db.data.set(getRefOfStr(player.tankName), pos);
    pos += 5;
    if (needsInit) db.data.writeFloatLE(player.uptimeRn, pos);
    pos += 4;
    db.data.writeFloatLE(player.uptimeRn, pos);
    pos += 4;
    db.data.writeFloatLE(player.score, pos);
    pos += 4;
    return pos;
}
// Adds a server to the DB
const pushServer = (server) => {
    const addr = db.data.byteLength; // addr is at the end cuz pushing
    db.grow(kSizeOfServer); // increase size before adding a server
    const {meta, players, id} = server;
    let pos = addr;
    let k = Buffer.alloc(4, 0xFF);
    k.set(Buffer.from(id));
    db.data.set(k, pos);
    pos += 4;
    server.start = db.data.writeDoubleLE(Date.now(), pos);
    pos += 8;
    db.data.writeFloatLE(meta.mspt,pos);
    pos += 4;
    db.data.writeFloatLE(meta.uptime,pos);
    pos += 4;

    db.data.set(getRefOfStr(server.meta.code), pos);
    pos += 5;
    db.data.writeUint8(1, pos++);
    db.data.set(getRefOfStr(server.meta.host), pos);
    pos += 5;

    db.data.writeUint32LE(players.length, pos);
    pos += 4;
    db.grow(players.length * kSizeOfPlayer)
    for (let i = 0; i < players.length; ++i) {
        writePlayer(pos, {...players[i], uptimeRn: server.meta.uptime});
        pos += kSizeOfPlayer
    }
    return addr;
}

const updateServer = (server) => {
    const { meta, players, id } = server;
    let k = Buffer.alloc(4, 0xFF);
    k.set(Buffer.from(id));
    const latestAddress = db.data.lastIndexOf(k);
    let latest=null;
    if (latestAddress === -1 || (latest = readServer(latestAddress)).meta.uptime > meta.uptime+1) {
        // if this is a new server on the same id, just push a new server
        pushServer(server);
    } else {
        let pos = latestAddress;
        pos += 4;
        pos += 8;
        let newPollCount = latest.pollCount + 1;
        if (newPollCount >= 256) newPollCount = 255;
        db.data.writeFloatLE((latest.meta.mspt * latest.pollCount + meta.mspt) / newPollCount, pos);
        pos += 4;
        db.data.writeFloatLE(meta.uptime, pos);
        pos += 4;
        pos += 5;
        db.data.writeUint8(newPollCount, pos++);
        pos += 5;
        // now we need to maintain players
        const curPlayers = latest.playerCount;
        pos = latest.playersPtr;
        let playersKnown = [];
        let i = 0;
        for (; i < curPlayers; ++i) {
            playersKnown.push(readPlayer(pos));
            pos += kSizeOfPlayer
        }
        for (const p of players) {
            let pk;
            if (pk = playersKnown.find(e => e.id === p.id)) {
                pk.tankName = p.tankName;
                pk.uptimeRn = meta.uptime;
                pk.score = p.score;
                pk.__upd = true;
            } else {
                pk = {};
                pk.id = p.id;
                pk.name = p.name;
                pk.teamColor = p.teamColor;
                pk.tankName = p.tankName;
                pk.uptimeRn = meta.uptime;
                pk.score = p.score;
                pk.__upd = true;
                playersKnown.push(pk);
            }
        }
        pos = latest.playersPtr - 4;
        db.data.writeUint32LE(playersKnown.length, pos);
        pos += 4;
        db.grow((playersKnown.length - curPlayers) * kSizeOfPlayer, pos + curPlayers * kSizeOfPlayer);
        for (i = 0; i < playersKnown.length; ++i) {
            if (playersKnown[i].__upd) writePlayer(pos, playersKnown[i]);
            pos += kSizeOfPlayer
        }
    }
}

db.update = (servers) => {
    db.data = readFileSync(OBJ_FILE);
    for (const server of servers) {
        updateServer(server);
    }
    writeFileSync(OBJ_FILE, db.data);
}

db.dump = () => {
    db.data = readFileSync(OBJ_FILE);
    let pos = 0;
    const servers = [];
    while (pos < db.data.byteLength) {
        const server = readServer(pos);
        pos += kSizeOfServer;
        server.meta.code = getStrOfRef(server.meta.code);
        server.meta.host = getStrOfRef(server.meta.host);
        server.players = Array(server.playerCount);
        pos = server.playersPtr;
        for (let i = 0; i < server.playerCount; ++i) {
            const p = server.players[i] = readPlayer(pos);
            p.name = getStrOfRef(p.name);
            p.tankName = getStrOfRef(p.tankName);
            pos += kSizeOfPlayer;
        }
        servers.push(server)
    }
    return servers;
}

db.log = () => {
    console.dir(db.dump(), { depth: 20 });
}

module.exports = db;