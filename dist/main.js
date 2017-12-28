#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli = require("yargs");
const debug = require("./debug");
// tslint:disable-next-line:no-var-requires
const yargonaut = require('yargonaut')
    .style('blue')
    .helpStyle('green');
cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});
const defaultArgs = (yargs) => {
    return yargs;
};
const each_1 = require("./commands/each");
each_1.register(cli);
const list_1 = require("./commands/list");
list_1.register(cli);
const last_1 = require("./commands/last");
last_1.register(cli);
const commit_1 = require("./commands/commit");
commit_1.register(cli);
const update_1 = require("./commands/update");
update_1.register(cli);
const add_1 = require("./commands/add");
add_1.register(cli);
const argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
}
else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    debug.info(pkginfo.version);
    process.exit();
}
//# sourceMappingURL=main.js.map