'use strict';

var cli = require("yargs"),
    path = require("path"),
    fs = require("fs"),
    modules = require("./modules"),
    git = require("./git"),
    mkdirp = require("mkdirp"),
    _ = require("lodash"),
    Q = require("q"),
    child_process = require("child_process");

cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});

/**
 * Find a module config by path or name
 * @param nameOrPath {string}
 * @param modules {object[]}
 * @returns {null|object}
 */
function getModuleConfig(nameOrPath,modules) {
    for (var i = 0; i < modules.length; i++) {
        var config = modules[i];
        if (config.options && (config.options.directory === nameOrPath || config.name === nameOrPath)) {
            return config;
        }
    }
    return null;
}
/**
 *
 * @param module {object}
 * @param commandOptions
 */
function doModulePost(module,commandOptions) {
    var moduleOptions = module.options;
    if (commandOptions && commandOptions.post && commandOptions.post.command) {
        var moduleCWD = path.join(argv.target, moduleOptions.directory);
        try {
            if (fs.statSync(moduleCWD).isDirectory()) {
                console.log('run post : ' + commandOptions.post.command + ' in ' + moduleCWD);
                child_process.exec(commandOptions.post.command, {
                    cwd: moduleCWD
                }, function (err, stdout, stderr) {
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
}
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
function doGitCommand(module,command,gitOptions,gitArgs,where,errorCB,stdOutCB){
    var gitp = new git({
        cwd: where
    });
    gitOptions = gitOptions || {};
    gitArgs = gitArgs || [];
    return gitp.exec(command, gitOptions, gitArgs, function (err, stdout, stderr) {
        if (err && stderr) {
            console.log('Error running git command for ' + module.name + ': ', "\n\t" + stderr);
            if (stderr && errorCB) {
                errorCB(err,stderr);
            }
        }
        if(stdout && stdOutCB){
            stdOutCB(stdout);
        }
    }, true);
}

/**
 * Filter modules against cmd arg
 * @param argv {object}
 * @param modules {object[]}
 * @returns {*}
 */
function getModules(argv,modules){
    if(argv.module){
        var which = getModuleConfig(argv.module,modules);
        if(which){
            return [which];
        }else{
            return [];
        }
    }
    return modules;
}


cli.command('init-modules', 'Init modules provided in package.json or package.js', function (yargs) {
        return yargs.option('target', {
            alias: 'target',
            "default": process.cwd()
        }).option('source', {
            alias: 'source',
            "default": process.cwd()
        });
    },
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            var _modules = modules.getModules(argv.source);
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
                return;
            }
            var dfd = Q.defer();

            //ensure target
            mkdirp.sync(argv.target);

            var all = [];

            var command = "clone";

            _.each(_modules, function (module) {
                var gitOptions = {};
                var moduleOptions = module.options;
                moduleOptions.recursive && (gitOptions.recursive = true);
                moduleOptions.verbose && (gitOptions.verbose = true);
                var gitArgs = [moduleOptions.repository, moduleOptions.directory];
                var gitFailed = false;

                var cwd = path.resolve(argv.target);
                var exec = doGitCommand(module,command,gitOptions,gitArgs,cwd,function(){
                    gitFailed = true;
                },null);

                exec.then(function () {
                    gitFailed!==true && doModulePost(module,module[command]);
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

cli.command('update-modules', 'update modules provided in package.json or package.js', function (yargs) {
        return yargs.option('target', {
            alias: 'target',
            "default": process.cwd()
        }).option('source', {
            alias: 'source',
            "default": process.cwd()
        }).option('module', {
            alias: 'module'
        });
    },
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            var _modules = getModules(argv,modules.getModules(argv.source));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            var dfd = Q.defer();

            //ensure target
            mkdirp.sync(argv.target);
            var all = [];
            _.each(_modules, function (module) {
                var moduleOptions = module.options;
                var cwd = path.resolve(path.join(argv.target,moduleOptions.directory));
                var exec = doGitCommand(module,'pull',null,null,cwd,null,null);
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
        return yargs.option('target', {
            alias: 'target',
            "default": process.cwd()
        }).option('source', {
            alias: 'source',
            "default": process.cwd()
        }).option('message', {
            alias: 'message',
            "default": "auto-commit"
        }).option('module', {
            alias: 'module'
        });
    },
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            var _modules = getModules(argv,modules.getModules(argv.source));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            var dfd = Q.defer();



            //ensure target
            mkdirp.sync(argv.target);
            var all = [];
            _.each(_modules, function (module) {
                var moduleOptions = module.options;
                var cwd = path.resolve(path.join(argv.target,moduleOptions.directory));
                var gitCommitFailed = false;
                var gitCommit = doGitCommand(module,"commit",null,[".","--message=" + "\"" +argv.message + "\""],cwd,function(){
                    gitCommitFailed = true;
                },null);
                var gitPush = gitCommitFailed!==true && doGitCommand(module,"push",null,[""],cwd,null,null);
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

    return yargs.option('target', {
            alias: 'target',
            "default": process.cwd()
        }).option('source', {
            alias: 'source',
            "default": process.cwd()
        }).option('cmd', {
            alias: 'cmd',
            "default": "git status"
        }).option('module', {
            alias: 'module'
        });
    },
    function (argv) {
        if (argv.help) {
            return;
        }
        try {
            var _modules = getModules(argv,modules.getModules(argv.source));
            if (!_modules || !_modules.length) {
                console.warn('have nothing to do, abort');
            }
            var dfd = Q.defer();


            //ensure target
            mkdirp.sync(argv.target);
            var all = [];
            _.each(_modules, function (module) {
                var moduleOptions = module.options;
                var cwd = path.resolve(path.join(argv.target,moduleOptions.directory));
                var exec = doGitCommand(module,argv.cmd,{nogit:true},null,cwd,null,function(stdout){
                    console.log("\tModule cmd " +argv.cmd + ' for ' +module.name +'\t'+stdout);
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

var argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
} else if (argv.v || argv.version) {
    var pkginfo = require('../package.json');
    console.log(pkginfo.version);
    process.exit();
}