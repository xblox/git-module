import * as globby from 'globby';
import { join, resolve as pathResolve } from 'path';
import * as commands from './commands';
import { Config, default as conf } from './config';

export type YargsCommandNames = Map<string, Set<string>>;

/**
 * Enumerate all the installed commands and return their absolute paths
 * N.B. we return globby's promise (its not a native node Promise, but a 'pinky-promise' wrapper) - LOL
 * @param config
 * @returns {Promise<string []>} the paths of all installed commands
 */
export async function enumerateInstalledCommands(config: Config): Promise<string[]> {
    const { searchPrefixes } = config;
    // tslint:disable-next-line:no-shadowed-variable
    const globPaths = searchPrefixes.reduce((globPaths: string[], key) => {
        return globPaths.concat(config.searchPaths.map((depPath) => pathResolve(depPath, `${key}-*`)));
    }, []);
    return globby(globPaths, { ignore: '**/*.map' });
}

/**
 * Enumerate all the builtIn commands and return their absolute paths
 * @param config
 * @returns {Promise<string []>} the paths of all builtIn commands
 */
export function enumerateBuiltInCommands(config: Config): string[] {
    const builtInCommandParentDirGlob = join(config.builtInCommandLocation, '/*.js');
    return globby.sync(builtInCommandParentDirGlob, { ignore: '**/*.map' });
}

export const load = (path: string, CLI: any) => {
    const mod = require(path);
    mod.default(CLI);
    return mod;
};

export async function loadBuiltInCommands(CLI: any) {
    const builtInCommandsPaths = commands.enumerateBuiltInCommands(conf);
    builtInCommandsPaths.forEach((path: string) => {
        load(path, CLI);
    });
}
