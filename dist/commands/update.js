"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("../debug");
const chalk = require("chalk");
const argv_1 = require("../argv");
const lib_1 = require("../lib");
const modules_1 = require("../modules");
const dir = require("@xblox/fs/dir");
const options = (yargs) => argv_1.defaultOptions(yargs.option('command', {
    describe: 'the command to run per module'
}));
const description = () => {
    return 'Run a command for all modules' +
        '\n\t Parameters : ' +
        chalk.green('\n\t\t\t --command=[command to run]');
};
exports.register = (cli) => {
    return cli.command('update', description(), options, (argv) => {
        if (argv.help) {
            return;
        }
        const args = argv_1.sanitize(argv);
        if (args.target) {
            dir.sync(args.target);
        }
        args.command = 'pull';
        if (args.verbose) {
            debug.info('Update modules');
        }
        const modules = modules_1.get(args.source, args.target, args.profile);
        const all = lib_1.each(modules, args, []);
        all.then((r) => debug.inspect('Update', r));
    });
};
//# sourceMappingURL=update.js.map