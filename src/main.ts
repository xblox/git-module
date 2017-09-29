// tslint:disable-next-line:no-var-requires
const yargonaut = require('yargonaut')
    .style('blue').helpStyle('green');

import * as cli from 'yargs';

import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as _ from 'lodash';
import * as child_process from 'child_process';

import { Git } from './git';
import * as Q from 'q';
import * as debug from './debug';
import * as bluebird from 'bluebird';
import { jetpack } from '@xblox/fs';
import { get, Helper } from './lib';
cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});
const defaultArgs = (yargs: any) => {
    return yargs;
};
// import { default as each } from './commands/each'; each(cli);
import * as commands from './commands';
commands.loadBuiltInCommands(cli);

cli.command('modules-info', 'Init modules provided in package.json or package.js', defaultArgs,
    // tslint:disable-next-line:no-shadowed-variable
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const pkgModules = get(argv.source, argv.profile);
            if (!pkgModules.length) {
                debug.warn('have nothing to do, abort');
                return;
            }
            debug.inspect('modules', pkgModules);

            const all: any[] = [];
            const command = "status";
            pkgModules.forEach((module: any) => {
                const gitOptions: any = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                const cwd = path.resolve(path.join(argv.target, moduleOptions.directory));
                if (!jetpack().exists(cwd)) {
                    console.log('doesnt exists : ' + cwd);
                    return;
                }
                const exec = Helper.run(module, command, gitOptions, gitArgs, cwd);
                /*
                                exec.then(() => {
                                    post(module, module[command]);
                                }, (e) => {
                                    debug.error(e);
                                });
                                */

                all.push(exec);
            });

        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

cli.command('init-modules', 'Init modules provided in package.json or package.js', defaultArgs,
    // tslint:disable-next-line:no-shadowed-variable
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const pkgModules = get(argv.source, argv.profile);
            if (!pkgModules.length) {
                console.warn('have nothing to do, abort');
                return;
            }
            // ensure target
            mkdirp.sync(argv.target);
            const command = "clone";
            const deleteBefore = argv.delete === 'true';
            const all2 = bluebird.mapSeries(pkgModules, (module: any) => {
                const gitOptions: any = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                const cwd = path.resolve(argv.target);
                const where = path.join(cwd, moduleOptions.directory);
                if (deleteBefore && jetpack().exists(where)) {
                    debug.info('already exists : ' + where + ' . Will remove it!');
                    jetpack().remove(where);
                }
                return Helper.run(module, command, gitOptions, gitArgs, cwd);
            });
        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

const argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();

    process.exit();
} else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    debug.info(pkginfo.version);
    process.exit();
}
