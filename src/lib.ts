import * as bluebird from 'bluebird';
import * as _ from 'lodash';
import * as path from 'path';
import * as debug from './debug';
import { Git } from './git';
import { Module } from './module';
import { IEachOptions, IGitModuleResult, IModuleConfig, IModules } from './types';
import * as ora from 'ora';

export { get } from './modules';
export const githubFilter = (module: IModuleConfig): boolean => {
    return module.isGithub === true;
};
// filter to select modules by a profile
export const profileFilter = (modules: IModules, profile: string): IModules => modules.filter((module) => module.options.profile === profile);

const config = (nameOrPath: string, modules: IModules) => _.find(modules, (modConfig: any) => {
    if (modConfig.options && (modConfig.options.directory === nameOrPath || modConfig.name === nameOrPath)) {
        return modConfig;
    }
});
const invalid = (module: IModuleConfig, message: string = 'Doesnt exists'): IGitModuleResult => {
    return {
        code: 1,
        message,
        module
    };
};
const already = (module: IModuleConfig, message: string = 'Already exists'): IGitModuleResult => {
    return {
        code: 0,
        message,
        module
    };
};

export const each = (modules: Module[], args: IEachOptions, gitArgs?: string[]) => {
    const command = args.command;
    const deleteBefore = args.delete === 'true';
    return bluebird.mapSeries(modules, (module: IModuleConfig) => {
        const gitOptions: any = {};
        const moduleOptions = module.options;
        gitArgs = gitArgs || [moduleOptions.repository, moduleOptions.directory];
        const cwd = path.resolve(args.target);
        if (module.exists && command === 'clone') {
            // debug.warn('Module already checked out: ' + module.options.repository + ' in ' + module.cwd + ' skipping!');
            return Promise.resolve(already(module));
        }
        if (!module.exists && command !== 'clone') {
            // debug.warn('Module not checked out yet : ' + module.options.repository + ' in ' + module.cwd + ' skipping!');
            // return Promise.resolve(invalid(module));
        }
        if (args.filter === 'github' && !module.isGithub) {
            return Promise.resolve(invalid(module, 'Skipped by filter : ' + args.filter));
        }
        const promise = Helper.run(module, command || '', gitOptions, gitArgs, module.cwd || '');
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
export class Helper {
    public static async run(module: IModuleConfig, command: string, gitOptions: any, gitArgs: string[], where: string): Promise<IGitModuleResult> {
        const gitProcess = new Git({
            cwd: where
        });
        const p = gitProcess.exec(command, gitOptions, gitArgs);
        const spinner = debug.spinner('Run ' + command + ' in ' + where + ' for module ' + module.name).start();
        p.then(() => spinner.stopAndPersist());
        p.catch((e) => debug.error('Error git command : ' + command));
        return p;
    }
}
