'use strict';

const cli = require("yargs"),
    path      = require("path"),
    fs        = require("fs"),
    modules        = require("./modules"),
    git        = require("./git"),
    mkdirp        = require("mkdirp"),
    _        = require("lodash"),
    Q        = require("q"),
    child_process = require("child_process");

cli.options('v', {
    alias: 'version',
    description: 'Display version number'
});

cli.options('i', {
    demand: true,
    alias: 'input',
    desc: 'The entry package',
    'default': process.cwd()
});


cli.command('init-modules', 'Init modules provided in package.json or package.js',
    function (yargs) {
        return yargs.option('target', {
            alias: 'target',
            "default": process.cwd()
        }).option('source', {
            alias: 'source',
            "default": process.cwd()
        });
    },function(argv){
        if(argv.help){
            return;
        }


        var _modules = modules.getModules(process.cwd());
        if(!_modules || !_modules.length){
            console.warn('have nothing to do, abort');
        }
        var dfd = Q.defer();

        //ensure target
        mkdirp.sync(argv.target);

        var all = [];

        _.each(_modules,function (module) {
            var gitp = new git({
                cwd:path.resolve(argv.target)
            });
            var gitOptions = {};
            var moduleOptions = module.options;
            moduleOptions.recursive && (gitOptions.recursive = true);
            moduleOptions.verbose && (gitOptions.verbose = true);
            //moduleOptions.f = true;;// && (gitOptions.verbose = true);
            var gitArgs = [moduleOptions.repository,moduleOptions.directory];
            all.push(gitp.exec('clone',gitOptions,gitArgs,function(err, stdout,stderr){
                console.log('-called something ',stderr);
            },true));
        });

        Q.all(all).then(function(){
            dfd.resolve();
            console.log('all good!');
        },function(e){
            console.error('something bad happened:',e);
            dfd.reject(e);
        });
        return dfd.promise;

    });

var argv = cli.argv;
if (argv.h || argv.help) {
    cli.showHelp();
    process.exit();
} else if (argv.v || argv.version) {
    var pkginfo = require('../package.json');
    console.log(pkginfo.version);
    process.exit();
}