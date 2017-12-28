"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("../debug");
const chalk = require("chalk");
const argv_1 = require("../argv");
const lib_1 = require("../lib");
const modules_1 = require("../modules");
const module_1 = require("../module");
const dir = require("@xblox/fs/dir");
const write_1 = require("@xblox/fs/write");
const read_1 = require("@xblox/fs/read");
const path = require("path");
const options = (yargs) => argv_1.defaultOptions(yargs.option('repository', {
    describe: 'the repository'
}).option('directory', { describe: 'at which location to mount the repository' }));
const description = () => {
    return 'Adds a git-module' +
        '\n\t Parameters : ' +
        chalk.green('\t\t\t --repository=[the repository]');
};
exports.register = (cli) => {
    return cli.command('add', description(), options, (argv) => {
        if (argv.help) {
            return;
        }
        const args = argv_1.sanitize(argv);
        if (args.target) {
            dir.sync(args.target);
        }
        const modules = modules_1.get(args.source, args.target);
        const found = modules_1.has(modules, args.repository, args.directory);
        if (found) {
            debug.error('The configuration has already this module, abort!');
            return -1;
        }
        const toAdd = new module_1.Module();
        toAdd.name = args.directory;
        toAdd.options = {
            directory: args.directory,
            repository: args.repository
        };
        modules.push(toAdd);
        const configPath = (path.join(args.source, 'package.json'));
        const configOut = read_1.sync(configPath, 'json');
        configOut.modules = modules.map((module) => module.pack());
        write_1.sync(configPath, configOut, { atomic: false });
        args.command = 'clone';
        lib_1.each([toAdd], args);
        return 1;
    });
};
//# sourceMappingURL=add.js.map