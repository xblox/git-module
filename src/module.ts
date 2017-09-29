import { IModuleConfig } from './types';
export const defaults = (options: IModuleConfig): IModuleConfig => {
    return {
        clone: options.clone || { post: {} },
        name: options.name || '',
        options: options.options || {
            directory: '',
            repository: ''
        }
    };
};
