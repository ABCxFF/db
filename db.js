const {existsSync, readFileSync, writeFileSync, appendFileSync } = require('fs');
const util = require('./util');

const OBJ = './db/OBJ.db';
const STR = './db/STR.db';

if (!existsSync(OBJ)) {
    util.log('db', "Object database file does not exist. Creating at " + OBJ);
    writeFileSync(OBJ, Buffer.from([]));
}

if (!existsSync(STR)) {
    util.log('db', "String map file does not exist. Creating at " + STR);
    writeFileSync(STR, Buffer.from([]));
}

const db = {};

db.getStringRef = (str) => {
    const buffer = Buffer.from(str);
    const raw = readFileSync(STR, 'binary');
    const offset = raw.indexOf(buffer);

    if (offset === -1) {
        appendFileSync(STR, buffer);
        return new Uint32Array([raw.byteLength, buffer.byteLength])
    }

    return new Uint32Array([offset, buffer.byteLength])
}

db.updateServer = (server) => {
    
}