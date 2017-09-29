import * as CLI from 'yargs';
import * as path from 'path';
import * as debug from './debug';
import { cwd } from './fs';
import { exec } from 'child_process';
const compressOutput = true;
const removeExtras = (str: string) => {
    if (compressOutput) {
        return str.replace(/\[(INF|ERR|WRN)\][\s]+/g, '');
    } else {
        return str;
    }
};

// tslint:disable-next-line:max-line-length
async function run(where: string, command: string, args: string[] = [], ignoreErrors: boolean, silent: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const cmd = command + ' ' + args.join(' ');
        // tslint:disable-next-line:no-unused-expression
        !silent && debug.info("\t Run command : " + cmd + " in " + where);
        const p = exec(cmd, {
            cwd: where,
            maxBuffer: 1024 * 1000,
        });
        let warning: string;
        let error: string;
        const options = {};

        p.stdout.on('data', function(d: string) {
            const message: string = removeExtras(d);
            if (silent) {
                return;
            }
            if (d.match(/^\[ERR\]/)) {
                error = error || message;
                debug.error('Error ' + error);
            } else if (d.match(/^\[WRN\]/)) {
                warning = warning || message;
                debug.info('\t' + message);
            } else {
                const dataLine: string = message.trim();
                if (dataLine) {
                    debug.info('\t Info ' + dataLine);
                }
            }
        });

        p.stderr.on('data', (d: string) => {
            debug.error(removeExtras(d));
        });

        const failOnWarn = true;
        p.on('exit', function(code) {
            if (error) {
                debug.error('\t Error on exit : ' + error);
            }

            if (warning && failOnWarn) {
                debug.warn('\t ' + warning + ' (see log for details)');
            }

            // Sencha CMD sometimes does not provide exit code when there are "only" warnings
            if (code !== 0 && code !== null) {
                debug.error('Exited with code: ' + code);
                reject();
            }
            resolve();

        });
    });
}

export default run;
