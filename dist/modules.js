"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const url = require("url");
const exists_1 = require("@xblox/fs/exists");
const lib_1 = require("./lib");
const module_1 = require("./module");
exports.complete = (module, root) => {
    const repo = module.options.repository || '';
    const parts = url.parse(repo);
    module.repoName = path.basename(parts.path || '', path.extname(repo));
    module.exists = exists_1.sync(path.join(root, module.options.directory)) !== false;
    const cwd = path.join(root, module.options.directory);
    if (exists_1.sync(cwd)) {
        module.cwd = cwd;
    }
    else {
        module.cwd = root;
    }
    module.isGithub = module.options.repository.indexOf('github.com') !== -1;
    return module;
};
exports.read = (source, target, profile) => {
    let pkginfo = null;
    let packageJSON = '';
    try {
        if (fs.statSync(source).isDirectory()) {
            if (fs.statSync(path.join(source + '/package.json'))) {
                packageJSON = path.join(source + '/package.json');
            }
        }
        else if (fs.statSync(path.join(process.cwd(), source)).isFile()) {
            packageJSON = path.join(process.cwd(), source);
        }
    }
    catch (e) {
        console.warn('error reading modules', e);
    }
    if (packageJSON) {
        pkginfo = require(packageJSON);
    }
    else {
        pkginfo = {};
    }
    if (pkginfo && pkginfo.modules) {
        return pkginfo.modules.map((module) => exports.complete(module, target));
    }
    else {
        return [];
    }
};
exports.get = (source, target, profile) => {
    let modules = exports.read(source, target, profile);
    if (profile) {
        modules = lib_1.profileFilter(modules, profile);
    }
    return modules.map((module) => {
        return module_1.Module.from(module);
    });
};
//# sourceMappingURL=modules.js.map