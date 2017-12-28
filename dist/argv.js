"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.sanitize = (argv) => {
    argv = argv;
    argv.source = path.resolve(argv.source);
    argv.target = path.resolve(argv.target);
    argv.profile = argv.profile || '';
    argv.filter = argv.filter || '';
    argv.verbose = argv.verbose === 'true' ? true : false;
    return argv;
};
exports.defaultOptions = (yargs) => {
    return yargs.option('target', {
        default: process.cwd(),
        describe: 'the command to run per module'
    }).option('source', {
        default: process.cwd(),
        describe: 'the source'
    }).option('profile', {
        describe: 'only use modules which specified that profile'
    }).option('filter', {
        describe: 'select github or gitlab repositories: --filter=github|gitlab'
    });
};
//# sourceMappingURL=argv.js.map