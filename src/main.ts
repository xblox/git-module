#!/usr/bin/env node
import * as bluebird from 'bluebird';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as cli from 'yargs';
import * as commands from './commands';
import * as debug from './debug';
import { get, Helper } from './lib';
import * as _each from './commands/each';
// tslint:disable-next-line:no-var-requires
const yargonaut = require('yargonaut')
    .style('blue')
    .helpStyle('green');

cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});
const defaultArgs = (yargs: any) => {
    return yargs;
};
import { register as registerEach } from './commands/each'; registerEach(cli);
import { register as registerList } from './commands/list'; registerList(cli);
import { register as registerLast } from './commands/last'; registerLast(cli);
import { register as registerCommit } from './commands/commit'; registerCommit(cli);
import { register as registerUpdate } from './commands/update'; registerUpdate(cli);
import { register as registerAdd } from './commands/add'; registerAdd(cli);

const argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();

    process.exit();
} else if (argv.v || argv.version) {
    // tslint:disable-next-line:no-var-requires
    const pkginfo = require('../package.json');
    debug.info(pkginfo.version);
    process.exit();
}
