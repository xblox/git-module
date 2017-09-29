import * as CLI from 'yargs';
import * as path from 'path';
import * as debug from '../debug';
import * as xfs from '../fs';
import { default as run } from '../run';
import * as bluebird from 'bluebird';
import { jetpack } from '@xblox/fs';
import { get, Helper, each } from '../lib';
import * as chalk from 'chalk';
import { sanitize, defaultOptions } from '../argv';
import { defaults } from '../module';
import { IEachOptions } from '../types';

/** @Todo: evtl. we want to override source or destination paths  */
const options = (yargs: CLI.Argv) => defaultOptions(yargs.option('command', {
    describe: 'the command to run per module'
}));

const description = (): string => {
    return 'Run a command for all modules' +
    '\n\t Parameters : ' +
    chalk.green('\n\t\t\t --command=[command to run]');
};
export const register = (cli: CLI.Argv) => {
    return cli.command('each-module', description(), options, (argv: CLI.Arguments) => {
        if (argv.help) { return; }
        const args = sanitize(argv) as IEachOptions;
        const pkgModules = get(argv.source, argv.profile);
        if (!pkgModules.length) {
            debug.warn('have nothing to do, abort');
            return;
        }
        return each(pkgModules, args);
    });
};
