import * as globby from 'globby';
import { resolve as pathResolve, join } from 'path';
// import { CommandsMap, CommandWrapper } from './command';
import { Config } from './config';
import * as cli from 'yargs';
import * as commands from './commands';
import { default as c } from './config';
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
export async function enumerateBuiltInCommands(config: Config): Promise<string[]> {
    const builtInCommandParentDirGlob = join(config.builtInCommandLocation, '/*.js');
    return globby(builtInCommandParentDirGlob, { ignore: '**/*.map' });
}

/**
 * Simple loader
 * @param path : string
 */
export const load = (path: string) => {
    const module = require(path);
    module.default(cli);
    return module;
};

export async function loadBuiltInCommands() {
    const builtInCommandsPaths = await commands.enumerateBuiltInCommands(c);
    builtInCommandsPaths.forEach((path: string) => {
        load(path);
    });
}
/**
 * Function to load commands given a search path and a load function. The load
 * function is injected for the purposes of abstraction and testing.
 * The commands are stored in a CommandsMap which uses a composite key of
 * group-name to store the Command. Currently the first of each group is
 * stored as the default command for that group.
 *
 * @param paths array of absolute paths to commands
 * @param load The load function, this takes a path and loads it using the searchPrefix
 * 	that it was pre-configured to look for.
 * @returns Promise This function is async and returns a promise once all
 * of the commands have been loaded.
 */
/*
export async function loadCommands(paths: string[], load: (path: string) => CommandWrapper): Promise<LoadedCommands> {
    return new Promise<any>((resolve, reject) => {
        const commandsMap = new Map();
        const yargsCommandNames: YargsCommandNames = new Map();

        paths.forEach((path) => {
            try {
                const commandWrapper = load(path);
                const { group, name } = commandWrapper;
                const compositeKey = `${group}-${name}`;

                if (!commandsMap.has(group)) {
                    // First of each type will be 'default' for now
                    // setDefaultGroup(commandsMap, group, commandWrapper);
                    yargsCommandNames.set(group, new Set());
                }

                if (!commandsMap.has(compositeKey)) {
                    commandsMap.set(compositeKey, commandWrapper);
                }

                const groupCommandNames = yargsCommandNames.get(group);
                if (groupCommandNames) {
                    groupCommandNames.add(compositeKey);
                }

            }catch (error) {
                error.message = `Failed to load module ${path}\nNested error: ${error.message}`;
                reject(error);
            }
        });

        resolve({
            commandsMap,
            yargsCommandNames
        });
    });
}
*/
