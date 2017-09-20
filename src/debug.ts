import * as chalk from 'chalk';
import * as util from 'util';
const log = console.log;
export const info = (msg: string, d?: any) => log(chalk.green(msg), d || '');
export const error = (msg: string, d?: any) => log(chalk.red(msg), d || '');
export const warn = (msg: string, d?: any) => log(chalk.yellow(msg), d || '');
export const debug = (msg: string, d?: any) => log(chalk.blue(msg), d || '');
export const inspect = (msg: string, d?: any) => log(chalk.blue(msg), JSON.stringify(d, null, 2) || '');
