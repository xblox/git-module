import * as chalk from 'chalk';
import * as util from 'util';
const glog = console.log;
export const log = (msg: string, d?: any) => glog(chalk.magenta(msg), d || '');
export const info = (msg: string, d?: any) => glog(chalk.green(msg), d || '');
export const error = (msg: string, d?: any) => glog(chalk.red(msg), d || '');
export const warn = (msg: string, d?: any) => glog(chalk.yellow(msg), d || '');
export const debug = (msg: string, d?: any) => glog(chalk.blue(msg), d || '');
export const inspect = (msg: string, d?: any) => glog(chalk.blue(msg), JSON.stringify(d, null, 2) || '');
