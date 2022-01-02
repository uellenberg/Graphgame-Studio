import React, {useEffect, useRef, useState} from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import {lstat, readFile, writeFile} from "../../lib/files";

const Editor = ({file, recompile}: {file: string, recompile: () => void}) => {
    const [code, setCode] = useState("");

    //Switch to the new file when it changes.
    useEffect(() => {
        if(!file) return;

        const load = async () => {
            //Get the new code.
            const newCode = (await readFile(file) as Buffer)?.toString();
            //Update the current code.
            setCode(newCode);

            recompile();
        };

        load();
    }, [file]);

    //Save the code when it updates.
    useEffect(() => {
        const save = async () => {
            //Only save data if we're on a file.
            if(!file) {
                return;
            }

            //Write the code to the file.
            await writeFile(file, code);
            recompile();
        };

        save();
    }, [code]);

    return (
        <CodeEditor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => file.endsWith(".lm") ? highlight(code, languages.logimat, "logimat") : code}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                backgroundColor: "#222831",
                caretColor: "white",
                minHeight: "100%"
            }}
            readOnly={!file}
        />
    );
};

export default Editor;