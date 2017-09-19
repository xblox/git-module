// imports
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as Q from 'q';

export class Git {
    public binary = 'git';
    public cwd: string = '';
    public args: string;
    constructor(options: any) {
        this.binary = 'git';
        if (typeof options === 'undefined') {
            options = {};
        }
        this.cwd = options.cwd || process.cwd();
        delete options.cwd;
        this.args = this.optionsToString(options);
    }

    public optionsToString(options: any): string {
        const args = [];
        // tslint:disable-next-line:forin
        for (const k in options) {
            const val = options[k];
            if (k.length === 1) {
                // val is true, add '-k'
                if (val === true) {
                    args.push('-' + k);
                }else if (val !== false) {
                    // if val is not false, add '-k val'
                    args.push('-' + k + ' ' + val);
                }
            } else {
                if (val === true) {
                    args.push('--' + k);
                }else if (val !== false) {
                    args.push('--' + k + '=' + val);
                }
            }
        }
        return args.join(' ');
    }

    public exec(command: string, options: any, args: any, callback: any, ignoreErrors: boolean, verbose: boolean) {
        const dfd = Q.defer();
        if (options.nogit) {
            delete options.nogit;
            this.binary = "";
        }
        args = args.join(' ');
        options = this.optionsToString(options);
        const cmd = this.binary + ' ' + this.args + ' ' + command + ' ' + options + ' ' + args;
        // tslint:disable-next-line:no-console
        console.log("Run git command : " + cmd + " in " + this.cwd);

        exec(cmd, {
            cwd: this.cwd,
            maxBuffer: 1024 * 1000
        }, (err, stdout, stderr) => {
            callback(err, stdout, stderr);
            if (arguments[2] && err && ignoreErrors !== true) {
                dfd.reject(err.message);
            } else {
                dfd.resolve();
            }
        });
        return dfd.promise;
    }
}
