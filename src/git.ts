// imports
import { ChildProcess, exec, spawn, spawnSync } from 'child_process';
import * as stream from 'stream';
import { promisify } from 'util';
import { sync as which } from 'which';
import * as debug from './debug';
import { IGitModuleResult } from './types';

export enum STATUS {
    OK,
    ERROR,
    PENDING
}
const fatalHandler = (message: string, fn: (msg: string) => void): boolean => {
    if (message.startsWith('fatal:')) {
        fn('\t\ ' + message);
        return true;
    }
    return false;
};
const anyHandler = (message: string, fn: (msg: string) => void): void =>  fn('\t' + message);

// tslint:disable-next-line:no-empty
const subscribe = (signal: stream.Readable, collector: (data: any) => void = () => { }) => {
    const buffer: string[] = [];
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
const merge = (buffer: string[], data: any): string[] => buffer.concat(data);
const hook = (process: ChildProcess, resolve: any, reject: any, cmd: string) => {
    let buffer: string[] = [];
    const collector = (data: any) => { buffer = buffer.concat(data); };
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
        } else {
            resolve({
                code: STATUS.OK,
                command: cmd,
                messages: buffer
            });
        }
    });
    return process;
};

export class Git {
    public binary = 'git';
    public cwd: string = '';
    public args: string = '';
    constructor(options: any = {}) {
        this.binary = which(this.binary);
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
    public async exec(command: string, options: any = {}, args: any[] = []): Promise<IGitModuleResult> {
        args = [command].concat(this.optionsToArray(options).concat(args));
        return new Promise<IGitModuleResult>((resolve, reject) => {
            const p = spawn(this.binary, args, {
                cwd: this.cwd
            });
            return hook(p, resolve, reject, this.binary + ' ' + args.join(' '));
        });
    }
}
