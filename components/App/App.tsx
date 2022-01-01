import React, {useState} from "react";
import {Box, Grid} from "@mui/material";
import Display from "../Display/Display";
import Editor from "../Editor/Editor";
import Files from "../Files/Files";
import {compile} from "../../lib/compiler";

const App = () => {
    const [file, setFile] = useState("");

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
                    <Grid item md={4} height="100%" overflow="scroll">
                        <Editor file={file} recompile={() => compile(file)}/>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}

export default App;