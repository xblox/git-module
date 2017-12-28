import * as bluebird from 'bluebird';
import * as _ from 'lodash';
import * as path from 'path';
import * as debug from './debug';
import { Git } from './git';
import { Module } from './module';
import { IEachOptions, IGitModuleResult, IModuleConfig, IModules } from './types';
import * as ora from 'ora';
import * as cli from 'yargs';
export { get } from './modules';

export const githubFilter = (module: IModuleConfig): boolean => module.isGithub === true;
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
