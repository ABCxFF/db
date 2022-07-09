// define this at top so Intelli js is more op
const util = {};
// Use this for throwing errors (this changes the error name for more info);
util.throw = (name, message) => {
    const err = new Error(message);
    err.name = name;
    throw err;
}
// Use this for logging [sec] ...msg
util.log = (sec, ...msg) => {
    console.log(`[${sec}]`, ...msg);
}

module.exports = util;