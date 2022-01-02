import {compile} from "./compiler";

export {};

let compiling = false;

self.onmessage = async (msg) => {
    if(!msg.data.desmosMessage || compiling) return;

    compiling = true;

    try {
        const res = await compile(msg.data.file, msg.data.force);
        compiling = false;

        self.postMessage({desmosMessage: true, data: res});
    } catch(e) {
        compiling = false;
        throw e;
    }
};