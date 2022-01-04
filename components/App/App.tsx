import React, {useEffect, useRef, useState} from "react";
import {Box, Grid} from "@mui/material";
import Display from "../Display/Display";
import Editor from "../Editor/Editor";
import Files from "../Files/Files";
import Compile from "../Compile/Compile";
import {FindMain} from "../../lib/mainFile";
import Export from "../Export/Export";

declare const BrowserFS: any;

const App = () => {
    const [compileDisabled, setCompileDisabled] = useState(false);
    const [exportDisabled, setExportDisabled] = useState(true);

    const workerRef = useRef<Worker>();
    useEffect(() => {
        workerRef.current = new Worker(new URL("../../lib/compiler/compile-worker", import.meta.url));
        workerRef.current.onmessage = msg => {
            if(!msg.data.desmosMessage) return;

            switch(msg.data.type) {
                case "compiled":
                    const state = window.Calc.getState();
                    state.expressions.list = msg.data.data;
                    state.expressions.ticker = {
                        handlerLatex: "m_{ain}",
                        open: true,
                        playing: true
                    };

                    window.Calc.setState(state);

                    //Allow recompilation if compilation finished.
                    setCompileDisabled(false);

                    //Allow exporting after a compile.
                    setExportDisabled(false);
                    break;
                case "compiling":
                    //Don't allow recompiling during compilation.
                    setCompileDisabled(true);
                    break;
                case "fail":
                    //Allow recompiling if compilation failed.
                    setCompileDisabled(false);
                    break;
            }
        };
        BrowserFS.FileSystem.WorkerFS.attachRemoteListener(workerRef.current);

        return () => {
            //Kill the worker when the component unmounts.
            workerRef.current?.terminate();
            workerRef.current = undefined;
        };
    }, []);

    const [file, setFile] = useState("");

    const compile = async () => {
        //First, find the main.
        const main = await FindMain(file);
        //If there is no main, then we can just ignore this.
        if(!main) return;

        //Send the message to compile.
        workerRef.current?.postMessage({desmosMessage: true, type: "compile", main});
    };

    const resetFile = (file: string) => {
        //Send the message to reset.
        workerRef.current?.postMessage({desmosMessage: true, type: "reset", path: file});
    };

    const resetAll = () => {
        //Send the message to reset.
        workerRef.current?.postMessage({desmosMessage: true, type: "resetAll"});
    };

    return (
        <>
            <Box display={{base: "inherit", md: "none"}} height="100%">
                Graphgame Studio requires a larger display to function.
            </Box>
            <Box display={{base: "none", md: "inherit"}} height="100%">
                <Grid container height="100%">
                    <Grid item md={8} height="100%">
                        <Box height="60%">
                            <Display/>
                        </Box>
                        <Box height="40%">
                            <Files setFile={setFile} resetFile={resetFile} resetAll={resetAll}/>
                        </Box>
                    </Grid>
                    <Grid item md={4} height="100%">
                        <Box height="90%" style={{overflowY: "scroll"}}>
                            <Editor file={file} resetFile={resetFile}/>
                        </Box>
                        <Box height="10%" display="flex">
                            <Compile disabled={compileDisabled} compile={compile}/>
                            <Export disabled={exportDisabled}/>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default App;