import React, {useEffect, useRef, useState} from "react";
import {Box, Grid} from "@mui/material";
import Display from "../Display/Display";
import Editor from "../Editor/Editor";
import Files from "../Files/Files";
import Compile from "../Compile/Compile";

declare const BrowserFS: any;

const App = () => {
    const workerRef = useRef<Worker>();
    useEffect(() => {
        workerRef.current = new Worker(new URL("../../lib/compiler/compile-worker", import.meta.url));
        workerRef.current.onmessage = msg => {
            if(!msg.data.desmosMessage || !msg.data.data) return;

            const state = window.Calc.getState();
            state.expressions.list = msg.data.data;
            state.expressions.ticker = {
                handlerLatex: "m_{ain}",
                open: true,
                playing: true
            };

            console.log(msg.data);
            window.Calc.setState(state);
        };
        BrowserFS.FileSystem.WorkerFS.attachRemoteListener(workerRef.current);

        return () => {
            //Kill the worker when the component unmounts.
            workerRef.current?.terminate();
            workerRef.current = undefined;
        };
    }, []);

    const [file, setFile] = useState("");

    const compile = (force: boolean) => {
        workerRef.current?.postMessage({desmosMessage: true, file, force});
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
                            <Files setFile={setFile}/>
                        </Box>
                    </Grid>
                    <Grid item md={4} height="100%">
                        <Box height="90%" style={{overflowY: "scroll"}}>
                            <Editor file={file}/>
                        </Box>
                        <Box height="10%" display="flex">
                            <Compile compile={compile}/>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default App;