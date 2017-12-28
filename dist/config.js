"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
// tslint:disable-next-line:no-var-requires
const pkgDir = require('pkg-dir');
const packagePath = pkgDir.sync(__dirname);
exports.default = {
    // better to be relative to this file (like an import) than link to publish structure
    builtInCommandLocation: path_1.join(__dirname, '/commands'),
    searchPaths: [
        'node_modules',
        path_1.join(__dirname, '..', '..'),
        path_1.join(packagePath, 'node_modules')
    ],
    searchPrefixes: []
};
//# sourceMappingURL=config.js.map