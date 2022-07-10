const colors = require('colors/safe');
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
    console.log(colors.reset(`[${Date().split(' ')[4].slice(0, -3)}] `) + colors.magenta(`[${sec}]`), ...msg);
}
util.errLog = (sec, ...msg) => {
    console.log(colors.bold(colors.reset(`[${Date().split(' ')[4].slice(0, -3)}] `)) + colors.bold(colors.red(`[${sec}]`)), ...msg);
}

module.exports = util;