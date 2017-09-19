import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';

export const getModules = (root: string, profile: string) => {
    let pkginfo = null;
    let packageJSON = null;
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
    }
    const REPOSITORIES: any[] = [];

    /**
     * Helper function to add a new repo to our module list.
     * @param name {string} That is the unique name of the module.
     * @param rep {string} The repository url.
     * @param directory {null|string} The target directory to clone the module into.
     * @param gitOptions {null|object} A mixin to override default git options for the module added.
     * @param options {null|object} A mixin to override default options for the module added.
     */
    function addRepository(name: string, rep: string, directory: null|string, gitOptions: any, options: null|any) {
        const userConfig = options || {};
        REPOSITORIES.push(_.extend({
            name,
            options: _.extend({
                directory: directory || name,
                repository: rep
            }, gitOptions || {})
        }, userConfig));
    }

    let Package = null;

    try {
        Package = require(path.join(root + '/package.js'));
    } catch (e) {
        console.warn('no package.js in ' + root);
    }

    Package.getModules(null, addRepository);

    return REPOSITORIES;
};
