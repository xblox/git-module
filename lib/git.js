// imports
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Q = require('q');

var Git = module.exports = function (options) {
    this.binary = 'git';
    if (typeof options == 'undefined') {
        options = {};
    }

    this.cwd = options.cwd || process.cwd();
    delete options.cwd;

    this.args = Git.optionsToString(options);
};

// git.exec(command [[, options], args ], callback)
Git.prototype.exec = function (command, options, args, callback) {

    var dfd = Q.defer();

    callback = arguments[arguments.length - 1];

    if (arguments.length == 2) {
        options = {};
        args = [];
    } else if (arguments.length == 3) {
        args = arguments[1];
        options = [];
    }

    args = args.join(' ');
    options = Git.optionsToString(options);
    var cmd = this.binary + ' ' + this.args + ' ' + command + ' ' + options + ' ' + args;

    exec(cmd, {
        cwd: this.cwd
    }, function (err, stdout, stderr) {
        callback(err, stdout,stderr);
        if(arguments[2] && err){
            console.error('failed');
            dfd.reject(err.message);
        }else{
            dfd.resolve();
        }
    });

    return dfd.promise;

};

// converts an object that contains key value pairs to a argv string
Git.optionsToString = function (options) {
    var args = [];

    for (var k in options) {
        var val = options[k];

        if (k.length == 1) {
            // val is true, add '-k'
            if (val === true) {
                args.push('-' + k);
            }
            // if val is not false, add '-k val'
            else if (val !== false) {
                args.push('-' + k + ' ' + val);
            }
        } else {
            if (val === true) {
                args.push('--' + k);
            }
            else if (val !== false) {
                args.push('--' + k + '=' + val);
            }
        }
    }

    return args.join(' ');
};