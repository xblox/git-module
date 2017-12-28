"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const ora = require("ora");
// tslint:disable-next-line:no-var-requires
const jsome = require('jsome');
jsome.level.show = true;
const glog = console.log;
exports.log = (msg, d) => glog(chalk.magenta(msg), d || '');
exports.info = (msg, d) => glog(chalk.green(msg), d || '');
exports.error = (msg, d) => glog(chalk.red(msg), d || '');
exports.warn = (msg, d) => glog(chalk.yellow(msg), d || '');
exports.debug = (msg, d) => glog(chalk.blue(msg), d || '');
exports.inspect = (msg, d = null, pretty = true) => {
    glog(chalk.blue(msg));
    d && jsome(d);
};
exports.spinner = (msg) => ora(msg);
//# sourceMappingURL=debug.js.map