import {compile, ResetImports, ResetPath} from "./compiler";

export {};

let compiling = false;

self.onmessage = async (msg) => {
    if(!msg.data.desmosMessage) return;

    switch(msg.data.type) {
        case "compile":
            if(compiling) return;

            compiling = true;
            self.postMessage({desmosMessage: true, type: "compiling"});

            try {
                const res = await compile(msg.data.main);
                compiling = false;

                if(!res) self.postMessage({desmosMessage: true, type: "fail"});
                else self.postMessage({desmosMessage: true, type: "compiled", data: res});
            } catch(e) {
                compiling = false;
                self.postMessage({desmosMessage: true, type: "fail"});
                throw e;
            }

            break;
        case "reset":
            //Reset a specific file. We store the cached version of the file to save speed during
            //subsequent compiles, but we need to invalidate that cache if the file changes.
            ResetPath(msg.data.path);
            break;
        case "resetAll":
            ResetImports();
            break;
    }
};