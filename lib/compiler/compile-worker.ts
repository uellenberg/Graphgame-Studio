import {compile} from "./compiler";

export {};

let compiling = false;

self.onmessage = async (msg) => {
    if(!msg.data.desmosMessage || !msg.data.file || compiling) return;

    compiling = true;
    self.postMessage({desmosMessage: true, compiling: true});

    try {
        const res = await compile(msg.data.file, msg.data.force);
        compiling = false;

        if(!res) self.postMessage({desmosMessage: true, fail: true});
        else self.postMessage({desmosMessage: true, data: res});
    } catch(e) {
        compiling = false;
        self.postMessage({desmosMessage: true, fail: true});
        throw e;
    }
};