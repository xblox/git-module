
import { IModuleConfig, IModuleOptions } from './types';
import { serialize, Exclude } from 'class-transformer';
import * as lodash from 'lodash';
export const defaults = (options: IModuleConfig): IModuleConfig => {
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
export class Module implements IModuleConfig {
    public static from(json: IModuleConfig): Module {
        const ret = new Module();
        ret.name = json.name;
        ret.options = json.options;
        ret.repoName = json.repoName || '';
        ret.isGithub = json.isGithub !== undefined ? json.isGithub : false;
        ret.cwd = json.cwd || '';
        ret.exists = 'exists' in json ? json.exists : false;
        return ret;
    }

    public pack() {
        const ret = lodash.omitBy(JSON.parse(serialize<Module>(this)), lodash.isNil);
        return ret as Module;
    }

    @Exclude()
    public repoName: string = '';

    @Exclude()
    public cwd: string = '';

    @Exclude()
    public exists: boolean = false;

    @Exclude()
    public isGithub: boolean = false;

    public name: string = '';

    public options: IModuleOptions = {
        directory: '',
        profile: '',
        repository: ''
    };

    public serialize() {
        return serialize<Module>(this);
    }
}
