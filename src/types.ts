import * as CLI from 'yargs';

export interface IModuleOptions {
    repository: string;
    directory: string;
}

export interface IModulePost {
    command?: string;
}

export interface IModuleCloneOption {
    post?: IModulePost;
}

export interface IModuleConfig {
    name: string;
    options: IModuleOptions;
    clone?: IModuleCloneOption;
    repoName?: string;
}

export type IModules = IModuleConfig[];

export type IDefaultCLIArgs = CLI.Arguments & {
    source?: string;
    target?: string;
    module?: string;
    profile?: string;
};

export type IEachOptions = IDefaultCLIArgs & {
    delete?: boolean | string;
};
