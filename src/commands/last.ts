import * as debug from '../debug';
import * as chalk from 'chalk';
import * as CLI from 'yargs';
import { defaultOptions, sanitize } from '../argv';
import { each } from '../lib';
import { get } from '../modules';
import { IEachOptions } from '../types';
import * as dir from '@xblox/fs/dir';
const options = (yargs: CLI.Argv) => defaultOptions(yargs.option('command', {
    describe: 'the command to run per module'
}));

const description = (): string => {
    return 'Run a command for all modules' +
        '\n\t Parameters : ' +
        chalk.green('\n\t\t\t --command=[command to run]');
};
export const register = (cli: CLI.Argv) => {
    return cli.command('last', description(), options, (argv: CLI.Arguments) => {
        if (argv.help) { return; }
        const args = sanitize(argv) as IEachOptions;
        if (args.target) {
            dir.sync(args.target);
        }
        args.command = 'log';
        const modules = get(args.source, args.target, args.profile);
        const all = each(modules, args, ['-1']);
        all.then((r) => debug.inspect('Log', r));
    });
};
