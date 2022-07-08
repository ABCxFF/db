const util = {};
util.throw = (name, message) => {
    const err = new Error(message);
    err.name = name;
    throw err;
}
util.log = (sec, ...msg) => {
    console.log(`[${sec}]`, ...msg);
}

module.exports = util;