import * as CLI from 'yargs';

export interface IModuleOptions {
    repository: string;
    directory: string;
    profile: string;
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
    exists: boolean;
    cwd?: string;
    isGithub?: boolean;
}

export interface IGitModuleResult {
    code: number;
    message: string;
    module: IModuleConfig;
}
export type IModules = IModuleConfig[];

export type IDefaultCLIArgs = CLI.Arguments & {
    source: string;
    target: string;
    module: string;
    profile: string;
    filter?: string;
};

export type IEachOptions = IDefaultCLIArgs & {
    delete?: boolean | string;
    command?: string;
};
