import * as chalk from 'chalk';
import * as CLI from 'yargs';
import { defaultOptions, sanitize } from '../argv';
import { each } from '../lib';
import { get } from '../modules';
import { IEachOptions } from '../types';

const options = (yargs: CLI.Argv) => defaultOptions(yargs.option('command', {
    describe: 'the command to run per module'
}));

const description = (): string => {
    return 'Run a command for all modules' +
    '\n\t Parameters : ' +
    chalk.green('\n\t\t\t --command=[command to run]');
};
export const register = (cli: CLI.Argv) => {
    console.log('register!');
    return cli.command('each-module', description(), options, (argv: CLI.Arguments) => {
        if (argv.help) { return; }
        const args = sanitize(argv) as IEachOptions;
        const modules = get(argv.source, argv.profile);
        return each(modules, args);
    });
};
