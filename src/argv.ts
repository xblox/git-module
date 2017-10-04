import * as CLI from 'yargs';
import * as path from 'path';
import { IDefaultCLIArgs } from './types';

export const sanitize = (argv: any): IDefaultCLIArgs => {
    argv =  argv as IDefaultCLIArgs;
    argv.source = path.resolve(argv.source);
    argv.target = path.resolve(argv.target);
    argv.profile = argv.profile || '';
    return argv;
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
