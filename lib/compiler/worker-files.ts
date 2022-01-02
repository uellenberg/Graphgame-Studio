import util from "util";

declare const BrowserFS: any;

BrowserFS.configure({ fs: "WorkerFS", options: { worker: self }}, () => {});

export const fs = BrowserFS.BFSRequire("fs");

export const readdir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);