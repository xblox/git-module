// imports
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn, spawnSync, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as Q from 'q';
import { sync as which } from 'which';
import * as debug from './debug';
import * as stream from "stream";
const exep = promisify(exec);
const spwanp = promisify(spawnSync);
export enum STATUS {
    OK,
    ERROR,
    PENDING
}
const subscribe = (signal: stream.Readable, resolve: any, reject: any, collector?: (data: any) => void) => {
    return new Promise<any>((resolve, reject) => {
        const buffer: string[] = [];
        signal.on('message', (message) =>  debug.debug('message', message));
        signal.on('error', (error) =>  debug.error('std-error', error));
        signal.on('data', (data) => {
            buffer.push(data.toString().replace(/[\x00-\x1F\x7F-\x9F]/g, ""));
            collector && collector(buffer);
        });
    });
};
const hook = (process: ChildProcess, resolve: any, reject: any) => {
    let buffer = [];
    const collector = (data: any) =>  { buffer = buffer.concat(data); };
    const stdout = subscribe(process.stdout, resolve, reject, collector);
    const stderr = subscribe(process.stderr, resolve, reject, collector);
    process.on('exit', (code, signal) => {
        Promise.resolve(stdout);
        Promise.resolve(stderr);
        if (code) {
            resolve({
                code: STATUS.ERROR,
                error: code,
                messages: buffer
            });
        } else {
            resolve({
                code: STATUS.OK
            });
        }
    });
};

export class Git {
    public binary = 'git';
    public cwd: string = '';
    public args: string;
    constructor(options: any = {}) {
        this.binary = which('git');
        this.cwd = options.cwd || process.cwd();
    }
    public optionsToString(options: any): string {
        const args: any[] = [];
        // tslint:disable-next-line:forin
        for (const k in options) {
            const val = options[k];
            if (k.length === 1) {
                // val is true, add '-k'
                if (val === true) {
                    args.push('-' + k);
                } else if (val !== false) {
                    // if val is not false, add '-k val'
                    args.push('-' + k + ' ' + val);
                }
            } else {
                if (val === true) {
                    args.push('--' + k);
                } else if (val !== false) {
                    args.push('--' + k + '=' + val);
                }
            }
        }
        return args.join(' ');
    }
    public optionsToArray(options: any): string[] {
        const args: any[] = [];
        // tslint:disable-next-line:forin
        for (const k in options) {
            const val = options[k];
            if (k.length === 1) {
                // val is true, add '-k'
                if (val === true) {
                    args.push('-' + k);
                } else if (val !== false) {
                    // if val is not false, add '-k val'
                    args.push('-' + k + ' ' + val);
                }
            } else {
                if (val === true) {
                    args.push('--' + k);
                } else if (val !== false) {
                    args.push('--' + k + '=' + val);
                }
            }
        }
        return args;
    }
    public async exec(command: string, options: any, args: any, ignoreErrors: boolean, verbose: boolean) {
        args = [command].concat(this.optionsToArray(options).concat(args));
        return new Promise<string>((resolve, reject) => {
            const p = spawn(this.binary, args, {
                cwd: this.cwd
            });
            hook(p, resolve, reject);
        });
    }
}
