"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird = require("bluebird");
const _ = require("lodash");
const path = require("path");
const debug = require("./debug");
const git_1 = require("./git");
var modules_1 = require("./modules");
exports.get = modules_1.get;
exports.githubFilter = (module) => {
    return module.isGithub === true;
};
// filter to select modules by a profile
exports.profileFilter = (modules, profile) => modules.filter((module) => module.options.profile === profile);
const config = (nameOrPath, modules) => _.find(modules, (modConfig) => {
    if (modConfig.options && (modConfig.options.directory === nameOrPath || modConfig.name === nameOrPath)) {
        return modConfig;
    }
});
const invalid = (module, message = 'Doesnt exists') => {
    return {
        code: 1,
        message,
        module
    };
};
const already = (module, message = 'Already exists') => {
    return {
        code: 0,
        message,
        module
    };
};
exports.each = (modules, args, gitArgs) => {
    const command = args.command;
    const deleteBefore = args.delete === 'true';
    return bluebird.mapSeries(modules, (module) => {
        const gitOptions = {};
        const moduleOptions = module.options;
        const gArgs = gitArgs || [module.options.repository, module.options.directory];
        const cwd = path.resolve(args.target);
        if (module.exists && command === 'clone') {
            // debug.warn('\t Module already checked out: ' + module.options.repository + ' in ' + module.cwd + ' skipping!');
            return Promise.resolve(already(module));
        }
        if (!module.exists && command !== 'clone') {
            // debug.warn('Module not checked out yet : ' + module.options.repository + ' in ' + module.cwd + ' skipping!');
            // return Promise.resolve(invalid(module));
        }
        if (args.filter === 'github' && !module.isGithub) {
            return Promise.resolve(invalid(module, 'Skipped by filter : ' + args.filter));
        }
        const promise = Helper.run(module, command || '', gitOptions, gArgs, module.cwd || '');
        promise.then((result) => {
            result.module = module;
        });
        return promise;
    });
};
/*
export const post = (mod: IModuleConfig, commandOptions: any, target: string = '') => {
    mod = defaults(mod);
    const moduleOptions = mod.options;
    if (commandOptions && commandOptions.post && commandOptions.post.command) {
        const moduleCWD = path.join(target, moduleOptions.directory);
        try {
            if (fs.statSync(moduleCWD).isDirectory()) {
                debug.log('run post : ' + commandOptions.post.command + ' in ' + moduleCWD);
                child_process.exec(commandOptions.post.command, {
                    cwd: moduleCWD
                }, (err, stdout, stderr) => {
                    if (arguments[2] && err) {
                        debug.error('\t error running post cwd: ' + commandOptions.post.command, err);
                    }
                    debug.log('std : \t' + stdout);
                });
            }
        } catch (e) {
            debug.error('error running post job ' + mod.name);
        }
    }
};
*/
class Helper {
    static async run(module, command, gitOptions, gitArgs, where) {
        const gitProcess = new git_1.Git({
            cwd: where
        });
        const p = gitProcess.exec(command, gitOptions, gitArgs);
        const spinner = debug.spinner('Run ' + command + ' in ' + where + ' for module ' + module.name).start();
        p.then(() => spinner.stopAndPersist());
        p.catch((e) => debug.error('Error git command : ' + command));
        return p;
    }
}
exports.Helper = Helper;
//# sourceMappingURL=lib.js.map