import React, {useEffect, useRef, useState} from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import {lstat, readFile, writeFile} from "../../lib/files";

const Editor = ({file, resetFile}: {file: string, resetFile: (file: string) => void}) => {
    const [code, setCode] = useState("");

    //Switch to the new file when it changes.
    useEffect(() => {
        //Reset the code if the file resets.
        if(!file) {
            setCode("");
            return;
        }

        const load = async () => {
            //Get the new code.
            const newCode = (await readFile(file) as Buffer)?.toString();
            //Update the current code.
            setCode(newCode);
        };

        load();
    }, [file]);

    //Save the code when it updates.
    useEffect(() => {
        //Only save data if we're on a file.
        if(!file) return;

        const save = async () => {
            //Write the code to the file.
            await writeFile(file, code);
        };

        save();
    }, [code]);

    return (
        <CodeEditor
            value={code}
            onValueChange={code => {
                setCode(code);
                resetFile(file);
            }}
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
            tabSize={4}
        />
    );
};

export default Editor;