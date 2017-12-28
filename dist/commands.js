"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globby = require("globby");
const path_1 = require("path");
const commands = require("./commands");
const config_1 = require("./config");
/**
 * Enumerate all the installed commands and return their absolute paths
 * N.B. we return globby's promise (its not a native node Promise, but a 'pinky-promise' wrapper) - LOL
 * @param config
 * @returns {Promise<string []>} the paths of all installed commands
 */
async function enumerateInstalledCommands(config) {
    const { searchPrefixes } = config;
    // tslint:disable-next-line:no-shadowed-variable
    const globPaths = searchPrefixes.reduce((globPaths, key) => {
        return globPaths.concat(config.searchPaths.map((depPath) => path_1.resolve(depPath, `${key}-*`)));
    }, []);
    return globby(globPaths, { ignore: '**/*.map' });
}
exports.enumerateInstalledCommands = enumerateInstalledCommands;
/**
 * Enumerate all the builtIn commands and return their absolute paths
 * @param config
 * @returns {Promise<string []>} the paths of all builtIn commands
 */
function enumerateBuiltInCommands(config) {
    const builtInCommandParentDirGlob = path_1.join(config.builtInCommandLocation, '/*.js');
    return globby.sync(builtInCommandParentDirGlob, { ignore: '**/*.map' });
}
exports.enumerateBuiltInCommands = enumerateBuiltInCommands;
exports.load = (path, CLI) => {
    const mod = require(path);
    mod.default(CLI);
    return mod;
};
async function loadBuiltInCommands(CLI) {
    const builtInCommandsPaths = commands.enumerateBuiltInCommands(config_1.default);
    builtInCommandsPaths.forEach((path) => {
        exports.load(path, CLI);
    });
}
exports.loadBuiltInCommands = loadBuiltInCommands;
//# sourceMappingURL=commands.js.map