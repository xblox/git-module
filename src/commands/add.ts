import * as debug from '../debug';
import * as chalk from 'chalk';
import * as CLI from 'yargs';
import { defaultOptions, sanitize } from '../argv';
import { each } from '../lib';
import { get, read, has } from '../modules';
import { Module } from '../module';
import { IAddOptions, IEachOptions } from '../types';
import * as dir from '@xblox/fs/dir';
import { sync as writeSync } from '@xblox/fs/write';
import { sync as readSync } from '@xblox/fs/read';
import * as fs from 'fs';
import * as path from 'path';

const options = (yargs: CLI.Argv) => defaultOptions(
    yargs.option('repository', {
        describe: 'the repository'
    }
    ).option('directory', { describe: 'at which location to mount the repository' }));

const description = (): string => {
    return 'Adds a git-module' +
        '\n\t Parameters : ' +
        chalk.green('\t\t\t --repository=[the repository]');
};

export const register = (cli: CLI.Argv) => {
    return cli.command('add', description(), options, (argv: CLI.Arguments) => {
        if (argv.help) { return; }
        const args = sanitize(argv) as IAddOptions;
        if (args.target) {
            dir.sync(args.target);
        }

        const modules: Module[] = get(args.source, args.target);
        const found = has(modules, args.repository, args.directory);
        if (found) {
            debug.error('The configuration has already this module, abort!');
            return -1;
        }

        const toAdd = new Module();
        toAdd.name = args.directory;
        toAdd.options = {
            directory: args.directory,
            repository: args.repository
        };
        modules.push(toAdd);
        const configPath = (path.join(args.source, 'package.json'));
        const configOut: any = readSync(configPath, 'json');
        configOut.modules = modules.map((module) => module.pack());
        writeSync(configPath, configOut, { atomic: false });
        (args as IEachOptions).command = 'clone';
        each([toAdd], args);
        return 1;
    });
};
