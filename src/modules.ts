import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';

export const modules = (root: string, profile: string) => {
    let pkginfo: any = null;
    let packageJSON: any = null;
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

    // try package.json
    if (pkginfo && pkginfo.modules) {
        if (profile) {
            return pkginfo.modules.filter((module: any) => {
                return (!module.options.profile) || (module.options.profile === profile);
            });
        }
        return pkginfo.modules;
    } else {
        return [];
    }
};
