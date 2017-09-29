import { join } from 'path';
// tslint:disable-next-line:no-var-requires
const pkgDir = require('pkg-dir');
const packagePath = pkgDir.sync(__dirname);

// tslint:disable-next-line:interface-over-type-literal
export type Config = {
    searchPaths: string[],
    searchPrefixes: string[],
    builtInCommandLocation: string
};

export default {
    // better to be relative to this file (like an import) than link to publish structure
    builtInCommandLocation: join(__dirname, '/commands'),
    searchPaths: [
        'node_modules',
        join(__dirname, '..', '..'),
        join(packagePath, 'node_modules')
    ],
    searchPrefixes: []
} as Config;
