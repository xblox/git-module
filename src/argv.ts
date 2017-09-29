import * as CLI from 'yargs';
import { IDefaultCLIArgs } from './types';

export const sanitize = (argv: any): IDefaultCLIArgs => {
    return argv as IDefaultCLIArgs;
};

export const defaultOptions = (yargs: CLI.Argv) => {
    return yargs.option('target', {
        default: process.cwd(),
        describe: 'the command to run per module'
    }).option('source', {
        default: process.cwd(),
        describe: 'the source'
    }).option('profile', {
        describe: 'only use modules which specified that profile'
    });
};
