import {compile, ResetImports, ResetPath} from "./compiler";
import util from "util";

export {};

let compiling = false;

self.onmessage = async (msg) => {
    if(!msg.data.desmosMessage) return;

    switch(msg.data.type) {
        case "compile":
            if(compiling) return;

            compiling = true;
            self.postMessage({desmosMessage: true, type: "compiling"});

            //We'll collect all console.error outputs here, then combine them together if we get an error.
            const errorMsg: string[] = [];

            //Temporarily override console.error during compilation so that we can output any errors.
            const oldConsole = console.error;
            console.error = (...data: any[]) => {
                //Store the error message.
                errorMsg.push(util.format(...data));

                //Send the message to the old console.
                oldConsole(...data);
            };

            try {
                const res = await compile(msg.data.main);
                compiling = false;

                if(!res) self.postMessage({desmosMessage: true, type: "fail"});
                else self.postMessage({desmosMessage: true, type: "compiled", data: res});

                //Reset the console.
                console.error = oldConsole;
            } catch(e) {
                //Validate that the error is an actual error.
                if(e instanceof Error) {
                    //Add the error to the error messages.
                    errorMsg.push(e.name + ": " + e.message);

                    //Send an error message.
                    self.postMessage({desmosMessage: true, type: "error", message: errorMsg.join("\n")});
                }

                compiling = false;
                self.postMessage({desmosMessage: true, type: "fail"});

                //Reset the console.
                console.error = oldConsole;

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