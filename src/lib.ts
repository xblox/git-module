import * as cli from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as _ from 'lodash';
import * as child_process from 'child_process';
import { Git } from './git';
import * as debug from './debug';
import * as bluebird from 'bluebird';
import { IModules, IModuleConfig, IEachOptions } from './types';
import { defaults } from './module';
export { get } from './modules';

const config = (nameOrPath: string, modules: IModules) => _.find(modules, (modConfig: any) => {
    if (modConfig.options && (modConfig.options.directory === nameOrPath || modConfig.name === nameOrPath)) {
        return modConfig;
    }
});
export const each = (modules: IModules, args: IEachOptions) => {
    const command = args.command;
    const deleteBefore = args.delete === 'true';
    return bluebird.mapSeries(modules, (module: any) => {
        const gitOptions: any = {};
        const moduleOptions = module.options;
        moduleOptions.recursive && (gitOptions.recursive = true);
        moduleOptions.verbose && (gitOptions.verbose = true);
        const gitArgs = [moduleOptions.repository, moduleOptions.directory];
        const cwd = path.resolve(args.target);
        const where = path.join(cwd, moduleOptions.directory);
        return Helper.run(module, command, gitOptions, gitArgs, cwd);
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
    // tslint:disable-next-line:max-line-length
    public static async run(module: any, command: string, gitOptions: null | any, gitArgs: null | string[], where: string) {
        const gitp = new Git({
            cwd: where
        });
        gitOptions = gitOptions || {};
        gitArgs = gitArgs || [];
        const p = gitp.exec(command, gitOptions, gitArgs, true, true);
        debug.info('Run ' + command + ' in ' + where);
        p.then((result) => {
            console.log('result', JSON.stringify(result, null, 2));
        });
        p.catch((e) => debug.error('Error git command : ' + command));
        return p;
    }
}
/*
export const get = (argvIn: any, modulesIn: IModules = []): any[] => {
    if (argvIn.module) {
        const which = config(argvIn.module, modulesIn);
        if (which) {
            return [which];
        } else {
            return [];
        }
    }
    return modulesIn;
};
*/
