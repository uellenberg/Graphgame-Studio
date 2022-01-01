import React, {useEffect, useState} from "react";
import CodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";

const Editor = React.memo(() => {
    const [code, setCode] = useState("")

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
        />
    );
});

export default Editor;