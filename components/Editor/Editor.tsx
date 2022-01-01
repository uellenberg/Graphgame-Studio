import React, {useEffect, useRef, useState} from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import {readFile, writeFile} from "../../lib/files";

const Editor = ({file}: {file: string}) => {
    const [code, setCode] = useState("");

    const prevFile = useRef<string>();

    //Switch to the new file when it changes.
    useEffect(() => {
        if(!file) return;

        //Store the current code.
        const curCode = code;
        setCode("");

        const load = async () => {
            //Save the current code to the previous file.
            if(prevFile.current) writeFile(prevFile.current, curCode);

            //Get the new code.
            const newCode = (await readFile(file) as Buffer)?.toString();
            //Update the current code.
            setCode(newCode);
        };

        load();
    }, [file]);

    //Save the previous file.
    useEffect(() => {
        prevFile.current = file;
    }, [file]);

    //Save the code when it updates.
    useEffect(() => {
        const save = async () => {
            //Only save data if we're on a file.
            if(!file) {
                return;
            }
            console.log("success")

            //Write the code to the file.
            await writeFile(file, code);
        };

        save();
    }, [code]);

    return (
        <CodeEditor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => highlight(code, languages.logimat, "logimat")}
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