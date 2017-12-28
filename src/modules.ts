import * as fs from 'fs';
import * as path from 'path';
import { IModuleConfig } from './types';
import * as url from 'url';
import { fs as fsts } from '@xblox/fs/index';
import { sync as existsSync } from '@xblox/fs/exists';
import { githubFilter, profileFilter } from './lib';
import { Module } from './module';
import * as lodash from 'lodash';
// tslint:disable-next-line:no-var-requires
type IPackageModules = any & {
    modules: IModuleConfig[];
};

export const complete = (module: IModuleConfig, root: string): IModuleConfig => {
    const repo = module.options.repository || '';
    const parts = url.parse(repo);
    module.repoName = path.basename(parts.path || '', path.extname(repo));
    module.exists = existsSync(path.join(root, module.options.directory)) !== false;
    const cwd = path.join(root, module.options.directory);
    if (existsSync(cwd)) {
        module.cwd = cwd;
    } else {
        module.cwd = root;
    }
    module.isGithub = module.options.repository.indexOf('github.com') !== -1;
    return module;
};

export const read = (source: string, target: string, profile: string): any[] => {
    let pkginfo: IPackageModules = null;
    let packageJSON: string = '';
    try {
        if (fs.statSync(source).isDirectory()) {
            if (fs.statSync(path.join(source + '/package.json'))) {
                packageJSON = path.join(source + '/package.json');
            }
        } else if (fs.statSync(path.join(process.cwd(), source)).isFile()) {
            packageJSON = path.join(process.cwd(), source);
        }
    } catch (e) {
        console.warn('error reading modules', e);
    }
    if (packageJSON) {
        pkginfo = require(packageJSON);
    } else {
        pkginfo = {};
    }
    if (pkginfo && pkginfo.modules) {
        return pkginfo.modules.map((module: IModuleConfig) => complete(module, target));
    } else {
        return [];
    }
};

export const get = (source: string, target: string, profile: string = ''): Module[] => {
    let modules = read(source, target, profile);
    if (profile) {
        modules = profileFilter(modules, profile);
    }
    //return modules;

    return modules.map((module) => {
        return Module.from(module);
    });
};

export const has = (modules: Module[], repository: string, directory: string): Module | undefined => {
    const module = lodash.find(modules, {
        options: {
            directory,
            repository
        }
    });
    return module;
};
