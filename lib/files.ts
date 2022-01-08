import * as Path from "path";
import {FSModule} from "browserfs/dist/node/core/FS";
import * as util from "util";

declare const BrowserFS: any;

let FSReady = false;
export const OnFSReady = (func: () => void) : void => {
    if(FSReady) {
        func();
        return;
    }

    //@ts-ignore
    BrowserFS.install(window);
    //@ts-ignore
    BrowserFS.configure({
        fs: "IndexedDB",
        options: {}
    }, (e: Error | null) => {
        if(e) throw e;

        FSReady = true;
        func();
    });
};

export const fs: FSModule = typeof window !== "undefined" ? BrowserFS.BFSRequire("fs") : <FSModule>{};

export const readdir = typeof window !== "undefined" ? util.promisify(fs.readdir) : () => {};
export const readFile = typeof window !== "undefined" ? util.promisify(fs.readFile) : () => {};
export const lstat = typeof window !== "undefined" ? util.promisify(fs.lstat) : () => {};
export const mkdir = typeof window !== "undefined" ? util.promisify(fs.mkdir) : () => {};
export const unlink = typeof window !== "undefined" ? util.promisify(fs.unlink) : () => {};
export const rmdir = typeof window !== "undefined" ? util.promisify(fs.rmdir) : () => {};
export const rename = typeof window !== "undefined" ? (oldPath: string, newPath: string) => {
    return new Promise<void>((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if(err) return reject(err);
            resolve();
        });
    });
} : () => {};
export const writeFile = typeof window !== "undefined" ? (file: string, data: string | Buffer) => {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(file, data, (err) => {
            if(err) return reject(err);
            resolve();
        });
    });
} : () => {};
export const exists = typeof window !== "undefined" ? (file: string) => {
    return new Promise<boolean>((resolve, reject) => {
        fs.exists(file, exists => {
            resolve(exists);
        });
    });
} : () => {};

export const mkdirRecursive = async (path: string) : Promise<void> => {
    let parent = "/";

    for (const dir of path.split(/\//g)) {
        const path = Path.resolve(parent, dir);

        if(!(await exists(path))) await mkdir(path);

        parent = path;
    }
}

export const rmdirRecursive = async (path: string) : Promise<void> => {
    for(const file of await readdir(path) || []) {
        const filePath = Path.join(path, file);

        if((await lstat(filePath))?.isDirectory()) {
            await rmdirRecursive(filePath);
        } else {
            await unlink(filePath);
        }
    }

    await rmdir(path);
}

export const GetTree = async () : Promise<FileTree> => {
    if (typeof window === "undefined") {
        return [];
    }

    return (await createTree("/")).items || [];
}

const createTree = async (path: string) : Promise<File> => {
    const stat = await lstat(path);

    const info: File = {
        name: Path.basename(path),
        isDirectory: false
    };

    if(stat?.isDirectory()) {
        info.isDirectory = true;

        const files = <string[]>await readdir(path);

        const tree: FileTree = [];
        for(const file of files) {
            tree.push(await createTree(Path.join(path, file)));
        }

        info.items = tree;
    } else {
        info.size = stat?.size || 0;
    }

    return info;
}

export type FileTree = File[];

export interface File {
    name: string;
    isDirectory: boolean;
    size?: number;
    items?: FileTree;
}