import * as cli from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as _ from 'lodash';
import * as child_process from 'child_process';

import { Git } from './git';
import * as Q from 'q';
import { modules } from './modules';

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
const doGitCommand = (module: string, command: string, gitOptions: null | any, gitArgs: null | string[], where: string, errorCB: null | void, stdOutCB: null | void) => {
    const gitp = new Git({
        cwd: where
    });
    gitOptions = gitOptions || {};
    gitArgs = gitArgs || [];
    return gitp.exec(command, gitOptions, gitArgs, function (err, stdout, stderr) {
        if (err && stderr) {
            console.log('Error running git command for ' + module.name + ': ', "\n\t" + stderr);
            if (stderr && errorCB) {
                errorCB(err, stderr);
            }
        }
        if (stdout && stdOutCB) {
            stdOutCB(stdout);
        }
    }, true, true);
};

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
    });
};

cli.command('init-modules', 'Init modules provided in package.json or package.js', defaultArgs,
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = modules.getModules(argv.source, argv.profile);
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
                return;
            }
            const dfd = Q.defer();
            // ensure target
            mkdirp.sync(argv.target);

            const all = [];
            const command = "clone";
            _.each(_modules, function (module) {
                const gitOptions = {};
                const moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                const gitArgs = [moduleOptions.repository, moduleOptions.directory];
                let gitFailed = false;

                const cwd = path.resolve(argv.target);
                const exec = doGitCommand(module, command, gitOptions, gitArgs, cwd, function () {
                    gitFailed = true;
                }, null);

                exec.then(function () {
                    gitFailed !== true && doModulePost(module, module[command]);
                }, function (e) {
                    console.error(e);
                });

                all.push(exec);
            });

            Q.all(all).then(function () {
                dfd.resolve();
                console.log('all good!');
            }, function (e) {
                console.error('something bad happened:', e);
                dfd.reject(e);
            });

            return dfd.promise;
        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

cli.command('update-modules', 'update modules provided in package.json or package.js', defaultArgs,
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = getModules(argv, modules.getModules(argv.source, argv.profile));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            const dfd = Q.defer();

            // ensure target
            mkdirp.sync(argv.target);
            const all = [];
            _.each(_modules, function (module) {
                const moduleOptions = module.options;
                const cwd = path.resolve(path.join(argv.target, moduleOptions.directory));
                const exec = doGitCommand(module, 'pull', null, null, cwd, null, null);
                exec.then(function () {
                }, function (e) {
                    console.error(e);
                });

                all.push(exec);
            });

            Q.all(all).then(function () {
                dfd.resolve();
                console.log('all good!');
            }, function (e) {
                console.error('something bad happened:', e);
                dfd.reject(e);
            });

            return dfd.promise;
        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

cli.command('commit-modules', 'commit provided in package.json or package.js', function (yargs) {
    return defaultArgs(yargs).
        option('message', {
            alias: 'message',
            default: "auto-commit"
        });
},
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = getModules(argv, modules.getModules(argv.source));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            const dfd = Q.defer();

            // ensure target
            mkdirp.sync(argv.target);
            const all = [];
            _.each(_modules, function (module) {
                const moduleOptions = module.options;
                const cwd = path.resolve(path.join(argv.target, moduleOptions.directory));
                let gitCommitFailed = false;
                const gitCommit = doGitCommand(module, "commit", null, [".", "--message=" + "\"" + argv.message + "\""], cwd, function () {
                    gitCommitFailed = true;
                }, null);
                const gitPush = gitCommitFailed !== true && doGitCommand(module, "push", null, [""], cwd, null, null);
                all.push(gitCommit);
                gitPush && all.push(gitPush);
            });

            Q.all(all).then(function () {
                dfd.resolve();
                console.log('all good!');
            }, function (e) {
                console.error('something bad happened:', e);
                dfd.reject(e);
            });

            return dfd.promise;
        } catch (e) {
            console.log('Error ' + e, e.stack);
        }
    });

cli.command('each-module', 'run a command for each module provided in package.json or package.js', function (yargs) {
    return defaultArgs(yargs).option('cmd', {
        alias: 'cmd',
        default: "git status"
    });
},
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            const _modules = getModules(argv, modules.getModules(argv.source));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            const dfd = Q.defer();
            // ensure target
            mkdirp.sync(argv.target);
            const all = [];
            _.each(_modules, function (module) {
                const moduleOptions = module.options;
                const cwd = path.resolve(path.join(argv.target, moduleOptions.directory));
                const exec = doGitCommand(module, argv.cmd, { nogit: true }, null, cwd, null, function (stdout) {
                    console.log("\tModule cmd " + argv.cmd + ' for ' + module.name + '\t' + stdout);
                });
                exec.then(function () {
                }, function (e) {
                    console.error(e);
                });

                all.push(exec);
            });

            Q.all(all).then(function () {
                dfd.resolve();
                console.log('all good!');
            }, function (e) {
                console.error('something bad happened:', e);
                dfd.reject(e);
            });
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
    console.log(pkginfo.version);
    process.exit();
}
