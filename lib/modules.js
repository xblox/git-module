/* jshint node:true */
module.exports.getModules = function (root,profile) {
    var path = require('path');
    var _ = require('lodash');
    var fs = require('fs');
    var pkginfo = null;
    var packageJSON = null;
    try {
        if (fs.statSync(root).isDirectory()) {
            if (fs.statSync(path.join(root + '/package.json'))) {
                packageJSON = path.join(root + '/package.json');
            }
        } else if (fs.statSync(path.join(process.cwd(), root)).isFile()) {
            packageJSON = path.join(process.cwd(), root);
        }
    } catch (e) {
    }

    if (packageJSON) {
        pkginfo = require(packageJSON);
    } else {
        pkginfo = {};
    }

    //try package.json
    if (pkginfo && pkginfo.modules) {
        if(profile){
            return pkginfo.modules.filter(function(module){
                return (!module.options.profile) || (module.options.profile===profile);
            });
        }
        return pkginfo.modules;
    }
    var REPOSITORIES = [];

    /**
     * Helper function to add a new repo to our module list.
     * @param name {string} That is the unique name of the module.
     * @param rep {string} The repository url.
     * @param directory {null|string} The target directory to clone the module into.
     * @param gitOptions {null|object} A mixin to override default git options for the module added.
     * @param options {null|object} A mixin to override default options for the module added.
     */
    function addRepository(name, rep, directory, gitOptions, options) {
        var userConfig = options || {};

        REPOSITORIES.push(_.extend({
            name: name,
            options: _.extend({
                repository: rep,
                directory: directory || name
            }, gitOptions || {})
        }, userConfig));
    }

    var Package = null;

    try {
        Package = require(path.join(root + '/package.js'));
    } catch (e) {
        console.warn('no package.js in ' + root);
    }

    Package.getModules(null, addRepository);

    return REPOSITORIES;
};
