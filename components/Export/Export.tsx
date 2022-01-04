import {Button} from "@mui/material";
import {useState} from "react";
import ExportWindow from "./ExportWindow";

const Export = ({disabled}: {disabled: boolean}) => {
    const [exportWindowOpen, setExportWindowOpen] = useState(false);

    return (
        <>
            <Button variant="contained" disabled={disabled} onClick={() => setExportWindowOpen(true)} style={{margin: "auto"}} color="success">
                Export
            </Button>
            <ExportWindow open={exportWindowOpen} close={() => setExportWindowOpen(false)}/>
        </>
    );
};

export default Export;