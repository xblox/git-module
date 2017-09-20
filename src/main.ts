import * as cli from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as _ from 'lodash';
import * as child_process from 'child_process';

import { Git } from './git';
import * as Q from 'q';
import { modules } from './modules';
import * as debug from './debug';
import * as bluebird from 'bluebird';

import { jetpack } from '@xblox/fs';

cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});

/**
 * Find a module config by path or name
 * @param nameOrPath {string}
 * @param modulesIn {object[]}
 * @returns {null|object}
 */
const getModuleConfig = (nameOrPath: string, modulesIn: any) => {
    return _.find(modulesIn, (config: any) => {
        if (config.options && (config.options.directory === nameOrPath || config.name === nameOrPath)) {
            return config;
        }
    });
};
/**
 *
 * @param module {object}
 * @param commandOptions
 */
const doModulePost = (module: any, commandOptions: any) => {
    const moduleOptions = module.options;
    if (commandOptions && commandOptions.post && commandOptions.post.command) {
        const moduleCWD = path.join(argv.target, moduleOptions.directory);
        try {
            if (fs.statSync(moduleCWD).isDirectory()) {
                console.log('run post : ' + commandOptions.post.command + ' in ' + moduleCWD);
                child_process.exec(commandOptions.post.command, {
                    cwd: moduleCWD
                }, (err, stdout, stderr) => {
                    if (arguments[2] && err) {
                        console.error('\t error running post cwd: ' + commandOptions.post.command, err);
                    }
                    console.log('std : \t' + stdout);
                });
            }
        } catch (e) {
            console.error('error running post job ' + module.name);
        }
    }
};
/**
 *
 * @param module {object}
 * @param command {string}
 * @param gitOptions {object|null}
 * @param gitArgs {string[]|null}
 * @param where {string}
 * @param errorCB {null|function}
 * @param stdOutCB {null|function}
 */
// tslint:disable-next-line:max-line-length
class Helper {
    // tslint:disable-next-line:max-line-length
    public static async doGitCommand(module: any, command: string, gitOptions: null | any, gitArgs: null | string[], where: string, errorCB: any, stdOutCB: any) {
        const gitp = new Git({
            cwd: where
        });
        gitOptions = gitOptions || {};
        gitArgs = gitArgs || [];
        try {
            const p = gitp.exec(command, gitOptions, gitArgs, true, true);
            if (p) {
                p.then((result) => {
                    console.log('result', JSON.stringify(result, null, 2));
                });

                p.catch((e) => {
                    debug.error('Error git command : ' + command);
                });
                return p;
            }

        } catch (error) {
            debug.error('e');
        }

    }
}

/**
 * Filter modules against cmd arg
 * @param argv {object}
 * @param modules {object[]}
 * @returns {*}
 */
const getModules = (argvIn: any, modulesIn: any[] = []): any[] => {
    if (argvIn.module) {
        const which = getModuleConfig(argvIn.module, modulesIn);
        if (which) {
            return [which];
        } else {
            return [];
        }
    }
    return modulesIn;
};

const defaultArgs = (yargs: any) => {
    return yargs.option('target', {
        alias: 'target',
        default: process.cwd()
    }).option('source', {
        alias: 'source',
        default: process.cwd()
    }).option('profile', {
        alias: 'profile',
        default: 'default'
    }).option('module', {
        alias: 'module'
    }).option('delete', {
        alias: 'delete'
    });
};

cli.command('modules-info', 'Init modules provided in package.json or package.js', defaultArgs,
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = modules(argv.source, argv.profile);
            if (!_modules.length) {
                debug.warn('have nothing to do, abort');
                return;
            }
            debug.inspect('modules', _modules);

            const all: any[] = [];
            const command = "status";
            _.each(_modules, (module: any) => {
                const gitOptions: any = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                let gitFailed = false;

                const cwd = path.resolve(path.join(argv.target, moduleOptions.directory));
                if (!jetpack().exists(cwd)) {
                    console.log('doesnt exists : ' + cwd);
                    return;
                }
                const exec = Helper.doGitCommand(module, command, gitOptions, gitArgs, cwd, () => {
                    gitFailed = true;
                }, null);

                exec.then(() => {
                    gitFailed !== true && doModulePost(module, module[command]);
                }, (e) => {
                    debug.error(e);
                });

                all.push(exec);
            });

        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

cli.command('init-modules', 'Init modules provided in package.json or package.js', defaultArgs,
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = modules(argv.source, argv.profile);
            if (!_modules.length) {
                console.warn('have nothing to do, abort');
                return;
            }
            const dfd = Q.defer();
            // ensure target
            mkdirp.sync(argv.target);

            const all: any[] = [];
            const command = "clone";
            /*
            _.each(_modules, (module: any) => {
                const gitOptions: any = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                let gitFailed = false;

                const cwd = path.resolve(argv.target);
                const exec = doGitCommand(module, command, gitOptions, gitArgs, cwd, () => {
                    gitFailed = true;
                }, null);
                exec.then(() => {
                    gitFailed !== true && doModulePost(module, module[command]);
                }, (e) => {
                    debug.error(e);
                });
                all.push(exec);
            });
            */
            /*
            bluebird.all(all), (s) => {
                console.log('s', s);
            })*/
            const deleteBefore = argv.delete === 'true';
            const all2 = bluebird.mapSeries(_modules, (module: any) => {
                const gitOptions: any = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                let gitFailed = false;
                const cwd = path.resolve(argv.target);
                const where = path.join(cwd, moduleOptions.directory);
                if (deleteBefore && jetpack().exists(where)) {
                    debug.info('already exists : ' + where + ' . Will remove it!');
                    jetpack().remove(where);
                }
                return Helper.doGitCommand(module, command, gitOptions, gitArgs, cwd, () => {
                    gitFailed = true;
                    console.log('--done');
                }, debug.info);
            });

            /*

            Q.all(all).then(() => {
                dfd.resolve();
                console.log('all good!');
            }, (e) => {
                console.error('something bad happened:', e);
                dfd.reject(e);
            });
            */

            return dfd.promise;
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
