import * as CLI from 'yargs';
import * as path from 'path';
import { info, error, warn, debug } from './debug';
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
async function run(cwd: string, command: string, args: string[] = [], ignoreErrors: boolean, silent: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const cmd = command + ' ' + args.join(' ');
        // tslint:disable-next-line:no-unused-expression
        !silent && info("\t Run command : " + cmd + " in " + cwd);
        const p = exec(cmd, {
            cwd: cwd,
            maxBuffer: 1024 * 1000,
        });
        let _warning: string;
        let _error: string;
        let options = {};

        p.stdout.on('data', function(d: string) {
            const message: string = removeExtras(d);
            if (silent) {
                return;
            }
            if (d.match(/^\[ERR\]/)) {
                _error = _error || message;
                error('Error ' + _error);
            } else if (d.match(/^\[WRN\]/)) {
                _warning = _warning || message;
                info('\t' + message);
            } else {
                const dataLine: string = message.trim();
                if (dataLine) {
                    info('\t Info ' + dataLine);
                }
            }
        });

        p.stderr.on('data', (d: string) => {
            error(removeExtras(d));
        });

        const failOnWarn = true;
        p.on('exit', function(code) {
            if (_error) {
                error('\t Error on exit : ' + _error);
            }

            if (_warning && failOnWarn) {
                warn('\t ' + _warning + ' (see log for details)');
            }

            // Sencha CMD sometimes does not provide exit code when there are "only" warnings
            if (code !== 0 && code !== null) {
                error('Exited with code: ' + code);
                reject();
            }
            resolve();

        });
    });
}

export default run;
