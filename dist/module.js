"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const lodash = require("lodash");
exports.defaults = (options) => {
    return {
        clone: options.clone || { post: {} },
        exists: false,
        name: options.name || '',
        options: options.options || {
            directory: '',
            profile: null,
            repository: ''
        }
    };
};
class Module {
    constructor() {
        this.repoName = '';
        this.cwd = '';
        this.exists = false;
        this.isGithub = false;
        this.name = '';
        this.options = {
            directory: '',
            profile: '',
            repository: ''
        };
    }
    static from(json) {
        const ret = new Module();
        ret.name = json.name;
        ret.options = json.options;
        ret.repoName = json.repoName || '';
        ret.isGithub = json.isGithub !== undefined ? json.isGithub : false;
        ret.cwd = json.cwd || '';
        ret.exists = 'exists' in json ? json.exists : false;
        return ret;
    }
    pack() {
        const ret = lodash.omitBy(JSON.parse(class_transformer_1.serialize(this)), lodash.isNil);
        return ret;
    }
    serialize() {
        return class_transformer_1.serialize(this);
    }
}
tslib_1.__decorate([
    class_transformer_1.Exclude()
], Module.prototype, "repoName", void 0);
tslib_1.__decorate([
    class_transformer_1.Exclude()
], Module.prototype, "cwd", void 0);
tslib_1.__decorate([
    class_transformer_1.Exclude()
], Module.prototype, "exists", void 0);
tslib_1.__decorate([
    class_transformer_1.Exclude()
], Module.prototype, "isGithub", void 0);
exports.Module = Module;
//# sourceMappingURL=module.js.map