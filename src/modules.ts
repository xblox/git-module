import * as fs from 'fs';
import * as path from 'path';
import { IModuleConfig } from './types';
import * as url from 'url';
import { fs as fsts} from '@xblox/fs/index';
console.log('exists : ', fsts().exists('.'));
// tslint:disable-next-line:no-var-requires
type IPackageModules = any & {
    modules: IModuleConfig[];
};

export const complete = (module: IModuleConfig): IModuleConfig => {
    const repo = module.options.repository || '';
    const parts = url.parse(repo);
    module.repoName = path.basename(parts.path || '', path.extname(repo));
    return module;
};

export const get = (root: string, profile: string): any[] => {
    console.log('get modules from ' + root);
    root = path.resolve(root);

    let pkginfo: IPackageModules = null;
    let packageJSON: string = '';
    try {
        if (fs.statSync(root).isDirectory()) {
            if (fs.statSync(path.join(root + '/package.json'))) {
                packageJSON = path.join(root + '/package.json');
            }
        } else if (fs.statSync(path.join(process.cwd(), root)).isFile()) {
            packageJSON = path.join(process.cwd(), root);
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
        if (profile) {
            return pkginfo.modules.filter((module: any) => {
                return (!module.options.profile) || (module.options.profile === profile);
            });
        }
        return pkginfo.modules.map(complete);
    } else {
        return [];
    }
};
