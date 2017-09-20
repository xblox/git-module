import * as CLI from 'yargs';
import * as fs from 'fs';
import * as pathUtil from 'path';

export const cwd = (miimetiq: string = '') => pathUtil.resolve(pathUtil.join(process.cwd(), miimetiq));

export const exists = (path: string): boolean => {
    try {
        fs.statSync(path);
        return true;
    }catch (err) {
        return false;
    }
};
