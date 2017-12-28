"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// imports
const child_process_1 = require("child_process");
const which_1 = require("which");
const debug = require("./debug");
var STATUS;
(function (STATUS) {
    STATUS[STATUS["OK"] = 0] = "OK";
    STATUS[STATUS["ERROR"] = 1] = "ERROR";
    STATUS[STATUS["PENDING"] = 2] = "PENDING";
})(STATUS = exports.STATUS || (exports.STATUS = {}));
const fatalHandler = (message, fn) => {
    if (message.startsWith('fatal:')) {
        fn('\t\ ' + message);
        return true;
    }
    return false;
};
const anyHandler = (message, fn) => fn('\t' + message);
// tslint:disable-next-line:no-empty
const subscribe = (signal, collector = () => { }) => {
    const buffer = [];
    signal.on('message', (message) => debug.debug('message', message));
    signal.on('error', (error) => debug.error('std-error', error));
    signal.on('data', (data) => {
        const message = data.toString();
        buffer.push(message); // .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
        collector(buffer);
        // if (!fatalHandler(message, debug.warn)) {
        //  anyHandler(message, debug.inspect);
        // }
    });
};
const merge = (buffer, data) => buffer.concat(data);
const hook = (process, resolve, reject, cmd) => {
    let buffer = [];
    const collector = (data) => { buffer = buffer.concat(data); };
    const stdout = subscribe(process.stdout, collector);
    const stderr = subscribe(process.stderr, collector);
    process.on('exit', (code, signal) => {
        if (code) {
            resolve({
                code: STATUS.ERROR,
                command: cmd,
                error: code,
                messages: buffer
            });
        }
        else {
            resolve({
                code: STATUS.OK,
                command: cmd,
                messages: buffer
            });
        }
    });
    return process;
};
class Git {
    constructor(options = {}) {
        this.binary = 'git';
        this.cwd = '';
        this.args = '';
        this.binary = which_1.sync(this.binary);
        this.cwd = options.cwd || process.cwd();
    }
    optionsToString(options) {
        const args = [];
        // tslint:disable-next-line:forin
        for (const k in options) {
            const val = options[k];
            if (k.length === 1) {
                // val is true, add '-k'
                if (val === true) {
                    args.push('-' + k);
                }
                else if (val !== false) {
                    // if val is not false, add '-k val'
                    args.push('-' + k + ' ' + val);
                }
            }
            else {
                if (val === true) {
                    args.push('--' + k);
                }
                else if (val !== false) {
                    args.push('--' + k + '=' + val);
                }
            }
        }
        return args.join(' ');
    }
    optionsToArray(options) {
        const args = [];
        // tslint:disable-next-line:forin
        for (const k in options) {
            const val = options[k];
            if (k.length === 1) {
                // val is true, add '-k'
                if (val === true) {
                    args.push('-' + k);
                }
                else if (val !== false) {
                    // if val is not false, add '-k val'
                    args.push('-' + k + ' ' + val);
                }
            }
            else {
                if (val === true) {
                    args.push('--' + k);
                }
                else if (val !== false) {
                    args.push('--' + k + '=' + val);
                }
            }
        }
        return args;
    }
    async exec(command, options = {}, args = []) {
        args = [command].concat(this.optionsToArray(options).concat(args));
        return new Promise((resolve, reject) => {
            const p = child_process_1.spawn(this.binary, args, {
                cwd: this.cwd
            });
            return hook(p, resolve, reject, this.binary + ' ' + args.join(' '));
        });
    }
}
exports.Git = Git;
//# sourceMappingURL=git.js.map